

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
    let setRef: FirebaseFirestore.DocumentReference | null = null
    let workoutRef: FirebaseFirestore.DocumentReference | null = null

    if (workoutId && exerciseId) {
      workoutRef = db.collection('users').doc(userId).collection('workouts').doc(workoutId)
      const exerciseRef = workoutRef.collection('exercises').doc(exerciseId)
      const exDoc = await exerciseRef.get()
      if (!exDoc.exists) {
        throw createError({ statusCode: 404, statusMessage: 'Exercise not found' })
      }
      setRef = exerciseRef.collection('sets').doc(setId)
      const sDoc = await setRef.get()
      if (!sDoc.exists) {
        throw createError({ statusCode: 404, statusMessage: 'Set not found' })
      }
    } else {
      const setSnap = await db.collectionGroup('sets').where('id', '==', setId).limit(1).get()
      if (setSnap.empty) {
        throw createError({ statusCode: 404, statusMessage: 'Set not found' })
      }
      const setDoc = setSnap.docs[0]
      setRef = setDoc.ref
      const exerciseRef = setDoc.ref.parent.parent as FirebaseFirestore.DocumentReference
      workoutRef = exerciseRef.parent.parent as FirebaseFirestore.DocumentReference
    }
    const workoutDoc = await workoutRef.get()
    const ownerId = (workoutDoc.data() as any)?.userId
    if (ownerId !== userId) {
      throw createError({ statusCode: 404, statusMessage: 'Set not found' })
    }
    await setRef!.delete()
    return { success: true }
  } catch (error) {
    if ((error as any)?.statusCode === 404 || (error as any)?.statusCode === 400) {
      throw error
    }
    console.error('Error deleting set:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
