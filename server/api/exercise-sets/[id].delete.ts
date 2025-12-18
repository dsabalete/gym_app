

export default defineEventHandler(async (event) => {
  try {
    const setId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string
    const workoutId = getQuery(event).workoutId as string | undefined
    const exerciseId = getQuery(event).exerciseId as string | undefined

    if (!setId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Set ID and User ID are required' })
    }

    const db = getDb()
    let workoutRef: FirebaseFirestore.DocumentReference
    if (!workoutId) {
      // Slow fallback: search all workouts for the set
      const workoutsSnap = await db.collection('users').doc(userId).collection('workouts').get()
      const foundWorkout = workoutsSnap.docs.find(doc => {
        const data = doc.data()
        return (data.exercises || []).some((ex: any) => (ex.sets || []).some((s: any) => s.id === setId))
      })
      if (!foundWorkout) {
        throw createError({ statusCode: 404, statusMessage: 'Set not found in any workout' })
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
    const exercises = [...(data?.exercises || [])]

    let targetSetFound = false

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i]!
      const setIndex = (ex.sets || []).findIndex((s: any) => s.id === setId)
      if (setIndex !== -1) {
        ex.sets.splice(setIndex, 1)

        // Reorder remaining sets
        ex.sets = ex.sets.sort((a: any, b: any) => a.setNumber - b.setNumber)
        ex.sets.forEach((s: any, index: number) => {
          s.setNumber = index + 1
        })

        targetSetFound = true
        break
      }
    }

    if (!targetSetFound) {
      throw createError({ statusCode: 404, statusMessage: 'Set not found in workout' })
    }

    await workoutRef.update({
      exercises,
      updatedAt: new Date().toISOString()
    })
    return { success: true }
  } catch (error) {
    if ((error as any)?.statusCode === 404 || (error as any)?.statusCode === 400) {
      throw error
    }
    console.error('Error deleting set:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
