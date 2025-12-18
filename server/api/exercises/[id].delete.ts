

export default defineEventHandler(async (event) => {
  try {
    const exerciseId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string
    const workoutId = (getQuery(event).workoutId as string | undefined) ?? undefined

    if (!exerciseId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Exercise ID and User ID are required' })
    }

    const db = getDb()
    let workoutRef: FirebaseFirestore.DocumentReference
    let exerciseRef: FirebaseFirestore.DocumentReference

    if (!workoutId) {
      // Slow fallback: search all workouts for the exercise
      const workoutsSnap = await db.collection('users').doc(userId).collection('workouts').get()
      const foundWorkout = workoutsSnap.docs.find(doc => {
        const data = doc.data()
        return (data.exercises || []).some((ex: any) => ex.id === exerciseId)
      })
      if (!foundWorkout) {
        throw createError({ statusCode: 404, statusMessage: 'Exercise not found in any workout' })
      }
      workoutRef = foundWorkout.ref
    } else {
      workoutRef = db.collection('users').doc(userId).collection('workouts').doc(workoutId)
    }

    const workoutDoc = await workoutRef.get()
    if (!workoutDoc.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Workout not found' })
    }

    const data = workoutDoc.data()
    let exercises = [...(data?.exercises || [])]
    const exIndex = exercises.findIndex((ex: any) => ex.id === exerciseId)
    if (exIndex === -1) {
      throw createError({ statusCode: 404, statusMessage: 'Exercise not found in workout' })
    }

    // Remove exercise
    exercises.splice(exIndex, 1)

    // Reorder remaining exercises
    exercises = exercises.sort((a: any, b: any) => a.order - b.order)
    exercises.forEach((ex: any, index: number) => {
      ex.order = index
    })

    await workoutRef.update({
      exercises,
      updatedAt: new Date().toISOString()
    })

    return { success: true }
  } catch (error) {
    if ((error as any)?.statusCode === 400 || (error as any)?.statusCode === 404) {
      throw error
    }
    console.error('Error deleting exercise:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
