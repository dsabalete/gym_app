import { getDb, runTransaction } from '~/server/utils/firestore'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const exerciseId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string
    const body = await readBody(event)
    const workoutId = body?.workoutId as string | undefined
    const reps = Number(body?.reps ?? 0)
    const weight = Number(body?.weight ?? 0)
    const setNumberInput = body?.setNumber

    if (!exerciseId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Exercise ID and User ID are required' })
    }

    const db = getDb()
    let workoutRef: FirebaseFirestore.DocumentReference
    let exerciseRef: FirebaseFirestore.DocumentReference

    if (workoutId) {
      workoutRef = db.collection('users').doc(userId).collection('workouts').doc(workoutId)
      exerciseRef = workoutRef.collection('exercises').doc(exerciseId)
      const exerciseDoc = await exerciseRef.get()
      if (!exerciseDoc.exists) {
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

    const latestSnap = await exerciseRef.collection('sets').orderBy('setNumber', 'desc').limit(1).get()
    const nextNumber = (latestSnap.docs[0]?.data()?.setNumber ?? 0) + 1
    const setNumber = Number.isFinite(Number(setNumberInput)) && Number(setNumberInput) > 0 ? Number(setNumberInput) : nextNumber

    const setId = randomUUID()
    await runTransaction(async (tx) => {
      const setRef = exerciseRef.collection('sets').doc(setId)
      tx.set(setRef, { id: setId, setNumber, reps, weight, createdAt: new Date().toISOString() })
    })

    return { success: true, setId }
  } catch (error) {
    if ((error as any)?.statusCode === 404) {
      throw error
    }
    console.error('Error adding set:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
