

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
    let targetWorkoutRef: FirebaseFirestore.DocumentReference | null = null

    const workoutRef = db.collection('users').doc(userId).collection('workouts').doc(workoutId)
    const workoutDoc = await workoutRef.get()
    if (workoutDoc.exists) {
      targetWorkoutRef = workoutRef
    } else {
      const exSnap = await db.collectionGroup('exercises').where('id', '==', workoutId).limit(1).get()
      if (!exSnap.empty) {
        const exerciseDoc = exSnap.docs[0]
        targetWorkoutRef = exerciseDoc.ref.parent.parent as FirebaseFirestore.DocumentReference
      } else {
        const setSnap = await db.collectionGroup('sets').where('id', '==', workoutId).limit(1).get()
        if (setSnap.empty) {
          throw createError({ statusCode: 404, statusMessage: 'Workout not found' })
        }
        const setDoc = setSnap.docs[0]
        const exerciseRef = setDoc.ref.parent.parent as FirebaseFirestore.DocumentReference
        targetWorkoutRef = exerciseRef.parent.parent as FirebaseFirestore.DocumentReference
      }
    }

    const targetDoc = await targetWorkoutRef!.get()
    if (!targetDoc.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Workout not found' })
    }
    const workoutData = targetDoc.data() as any
    const workout: any = { id: targetDoc.id, ...workoutData, exercises: [] }

    const exercisesSnap = await targetDoc.ref.collection('exercises').get()
    const exerciseDocs = exercisesSnap.docs
      .map((d) => ({ id: d.id, data: d.data(), ref: d.ref }))
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    for (const ex of exerciseDocs) {
      const setsSnap = await ex.ref.collection('sets').get()
      const sets = setsSnap.docs
        .map((s) => ({ id: s.id, ...s.data() }))
        .sort((a, b) => {
          const an = Number((a as any).setNumber) || 0
          const bn = Number((b as any).setNumber) || 0
          return an - bn
        })
      workout.exercises.push({ id: ex.id, ...ex.data, sets })
    }

    return {
      success: true,
      workout
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
