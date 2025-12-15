import { getDb } from '~/server/utils/firestore'

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

    const verifyDoc = await targetWorkoutRef!.get()
    if (!verifyDoc.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Workout not found' })
    }
    const ownerId = (verifyDoc.data() as any)?.userId
    if (ownerId !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Workout belongs to a different user' })
    }

    const batch = db.batch()
    const exercisesSnap = await targetWorkoutRef!.collection('exercises').get()
    for (const exDoc of exercisesSnap.docs) {
      const setsSnap = await exDoc.ref.collection('sets').get()
      for (const setDoc of setsSnap.docs) {
        batch.delete(setDoc.ref)
      }
      batch.delete(exDoc.ref)
    }
    batch.delete(targetWorkoutRef!)
    await batch.commit()

    return { success: true, message: 'Workout deleted successfully' }
  } catch (error) {
    if ((error as any)?.statusCode === 404 || (error as any)?.statusCode === 403) {
      throw error
    }
    console.error('Error deleting workout:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
