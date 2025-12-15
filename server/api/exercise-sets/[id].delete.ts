import { getDb } from '~/server/utils/firestore'

export default defineEventHandler(async (event) => {
  try {
    const setId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string

    if (!setId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Set ID and User ID are required' })
    }

    const db = getDb()
    const setSnap = await db.collectionGroup('sets').where('id', '==', setId).limit(1).get()
    if (setSnap.empty) {
      throw createError({ statusCode: 404, statusMessage: 'Set not found' })
    }
    const setDoc = setSnap.docs[0]
    const exerciseRef = setDoc.ref.parent.parent as FirebaseFirestore.DocumentReference
    const workoutRef = exerciseRef.parent.parent as FirebaseFirestore.DocumentReference
    const workoutDoc = await workoutRef.get()
    const ownerId = (workoutDoc.data() as any)?.userId
    if (ownerId !== userId) {
      throw createError({ statusCode: 404, statusMessage: 'Set not found' })
    }
    await setDoc.ref.delete()
    return { success: true }
  } catch (error) {
    if ((error as any)?.statusCode === 404 || (error as any)?.statusCode === 400) {
      throw error
    }
    console.error('Error deleting set:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
