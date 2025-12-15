import { getDb } from '~/server/utils/firestore'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const workoutId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string
    const body = await readBody(event)
    const name = String(body?.name || '').trim()

    if (!workoutId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Workout ID and User ID are required' })
    }
    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'Exercise name is required' })
    }

    const db = getDb()
    const workoutRef = db.collection('users').doc(userId).collection('workouts').doc(workoutId)
    const workoutDoc = await workoutRef.get()
    if (!workoutDoc.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Workout not found' })
    }
    const exerciseId = randomUUID()
    await workoutRef.collection('exercises').doc(exerciseId).set({ id: exerciseId, name, createdAt: new Date().toISOString() })
    return { success: true, exerciseId }
  } catch (error) {
    if ((error as any)?.statusCode === 400 || (error as any)?.statusCode === 404) {
      throw error
    }
    console.error('Error adding exercise:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
