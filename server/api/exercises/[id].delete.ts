

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

    if (workoutId) {
      workoutRef = db.collection('users').doc(userId).collection('workouts').doc(workoutId)
      exerciseRef = workoutRef.collection('exercises').doc(exerciseId)
      const exDoc = await exerciseRef.get()
      if (!exDoc.exists) {
        throw createError({ statusCode: 404, statusMessage: 'Exercise not found' })
      }
    } else {
      const exSnap = await db.collectionGroup('exercises').where('id', '==', exerciseId).limit(1).get()
      if (exSnap.empty) {
        throw createError({ statusCode: 404, statusMessage: 'Exercise not found' })
      }
      const exerciseDoc = exSnap.docs[0]
      exerciseRef = exerciseDoc.ref
      workoutRef = exerciseDoc.ref.parent.parent as FirebaseFirestore.DocumentReference
    }
    const workoutDoc = await workoutRef.get()
    const ownerId = (workoutDoc.data() as any)?.userId
    if (ownerId !== userId) {
      throw createError({ statusCode: 404, statusMessage: 'Exercise not found' })
    }

    const batch = db.batch()
    const setsSnap = await exerciseRef.collection('sets').get()
    for (const setDoc of setsSnap.docs) {
      batch.delete(setDoc.ref)
    }
    batch.delete(exerciseRef)
    await batch.commit()

    return { success: true }
  } catch (error) {
    if ((error as any)?.statusCode === 400 || (error as any)?.statusCode === 404) {
      throw error
    }
    console.error('Error deleting exercise:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
