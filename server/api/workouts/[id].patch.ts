import { getDb } from '~/server/utils/firestore'

export default defineEventHandler(async (event) => {
  try {
    const workoutId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string
    const body = await readBody(event)
    const date = body?.date as string | undefined

    if (!workoutId || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Workout ID and User ID are required'
      })
    }

    if (!date) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No fields to update'
      })
    }

    const db = getDb()
    const workoutRef = db.collection('users').doc(userId).collection('workouts').doc(workoutId)
    const workoutDoc = await workoutRef.get()
    if (!workoutDoc.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Workout not found' })
    }

    const ownerId = (workoutDoc.data() as any)?.userId
    if (ownerId !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Workout belongs to a different user' })
    }

    await workoutRef.update({
      date,
      updatedAt: new Date().toISOString()
    })

    return { success: true }
  } catch (error) {
    if ((error as any)?.statusCode === 404 || (error as any)?.statusCode === 403 || (error as any)?.statusCode === 400) {
      throw error
    }
    console.error('Error updating workout:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
