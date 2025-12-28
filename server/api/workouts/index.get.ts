

import { filterOutArchived } from '../../services/workoutsHelpers'
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string
    const limit = parseInt(query.limit as string) || 50
    const offset = parseInt(query.offset as string) || 0

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const db = getDb()
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 50
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0

    const userRef = db.collection('users').doc(userId)
    const workoutsQuery = userRef
      .collection('workouts')
      .orderBy('date', 'desc')
      .limit(safeLimit)
      .offset(safeOffset)

    const workoutSnaps = await workoutsQuery.get()

    // Fetch all workouts and their sub-collections in parallel
    const workoutsRaw = await Promise.all(workoutSnaps.docs.map(async (workoutDoc) => {
      const workoutData = workoutDoc.data()
      let exercises = workoutData.exercises || []

      // If exercises sub-collection exists and document field is empty, fetch them (legacy support)
      if (exercises.length === 0) {
        const exercisesSnap = await workoutDoc.ref.collection('exercises').get()
        if (!exercisesSnap.empty) {
          exercises = await Promise.all(exercisesSnap.docs.map(async (exDoc) => {
            const exData = exDoc.data()
            const setsSnap = await exDoc.ref.collection('sets').orderBy('setNumber').get()
            const sets = setsSnap.docs.map(s => ({ id: s.id, ...s.data() }))
            return { id: exDoc.id, ...exData, sets }
          }))
        }
      }

      // Sort exercises by order
      exercises.sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999))

      return { id: workoutDoc.id, ...workoutData, exercises }
    }))

    const workouts = filterOutArchived(workoutsRaw)

    return {
      success: true,
      workouts,
      pagination: {
        limit,
        offset,
        total: workouts.length
      }
    }
  } catch (error) {
    console.error('Error fetching workouts:', error)
    throw createError({
      statusCode: 500,
      statusMessage: process.env.NODE_ENV === 'production' ? 'Internal server error' : (error as any)?.message || 'Internal server error'
    })
  }
})
