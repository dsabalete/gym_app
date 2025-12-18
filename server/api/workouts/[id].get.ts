

export default defineEventHandler(async (event) => {
  try {
    const workoutId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string

    if (!workoutId || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Workout ID and User ID are required'
      })
    }

    const db = getDb()
    const workoutRef = db.collection('users').doc(userId).collection('workouts').doc(workoutId)
    const targetDoc = await workoutRef.get()

    if (!targetDoc.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Workout not found' })
    }

    const workoutData = targetDoc.data() as any
    let exercises = workoutData.exercises || []

    // Legacy support: fetch from sub-collections if flattened data is missing
    if (exercises.length === 0) {
      const exercisesSnap = await workoutRef.collection('exercises').get()
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

    return {
      success: true,
      workout: {
        id: targetDoc.id,
        ...workoutData,
        exercises
      }
    }
  } catch (error) {
    if ((error as any)?.statusCode === 404) {
      throw error
    }
    console.error('Error fetching workout detail:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
