import { getDb } from '~/server/utils/firestore'

export default defineEventHandler(async (event) => {
  try {
    const setId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string
    const body = await readBody(event)
    const exerciseId = body?.exerciseId as string | undefined
    const workoutId = body?.workoutId as string | undefined

    if (!setId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Set ID and User ID are required' })
    }

    const fields: Record<string, any> = {}
    if (body?.setNumber !== undefined) fields.setNumber = Number(body.setNumber)
    if (body?.reps !== undefined) fields.reps = Number(body.reps)
    if (body?.weight !== undefined) fields.weight = Number(body.weight)

    if (!Object.keys(fields).length) {
      throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
    }

    const db = getDb()
    let workoutRef: FirebaseFirestore.DocumentReference
    let setRef: FirebaseFirestore.DocumentReference

    if (exerciseId && workoutId) {
      workoutRef = db.collection('users').doc(userId).collection('workouts').doc(workoutId)
      const exerciseRef = workoutRef.collection('exercises').doc(exerciseId)
      setRef = exerciseRef.collection('sets').doc(setId)
      const exists = await setRef.get()
      if (!exists.exists) {
        throw createError({ statusCode: 404, statusMessage: 'Set not found' })
      }
    } else {
      const setSnap = await db.collectionGroup('sets').where('id', '==', setId).limit(1).get()
      if (setSnap.empty) {
        throw createError({ statusCode: 404, statusMessage: 'Set not found' })
      }
      const setDoc = setSnap.docs[0]
      const exerciseRef = setDoc.ref.parent.parent as FirebaseFirestore.DocumentReference
      workoutRef = exerciseRef.parent.parent as FirebaseFirestore.DocumentReference
      setRef = setDoc.ref
    }

    const workoutDoc = await workoutRef.get()
    const ownerId = (workoutDoc.data() as any)?.userId
    if (ownerId !== userId) {
      throw createError({ statusCode: 404, statusMessage: 'Set not found' })
    }
    await setRef.update(fields)
    return { success: true }
  } catch (error) {
    if ((error as any)?.statusCode === 404 || (error as any)?.statusCode === 400) {
      throw error
    }
    console.error('Error updating set:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
