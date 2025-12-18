

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
    const workouts: any[] = []

    for (const workoutDoc of workoutSnaps.docs) {
      const workoutData = workoutDoc.data()
      const exercisesSnap = await workoutDoc.ref.collection('exercises').get()
      const exercises: any[] = []
      const exerciseDocs = exercisesSnap.docs
        .map((d) => ({ id: d.id, data: d.data() as any }))
        .sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999))

      for (const exerciseDoc of exerciseDocs) {
        const setsSnap = await db.collection('users').doc(userId)
          .collection('workouts').doc(workoutDoc.id)
          .collection('exercises').doc(exerciseDoc.id)
          .collection('sets').orderBy('setNumber').get()
        const sets = setsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        exercises.push({ id: exerciseDoc.id, ...exerciseDoc.data, sets })
      }
      workouts.push({ id: workoutDoc.id, ...workoutData, exercises })
    }

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
