import { createRdsClient } from '~/server/utils/aws-rds'
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

    const client = createRdsClient()

    const verify = await client.execute(
      `SELECT id, user_id FROM workouts WHERE id = :id`,
      { id: workoutId }
    )
    if (!verify.records.length || verify.records[0].user_id !== userId) {
      throw createError({ statusCode: 404, statusMessage: 'Workout not found' })
    }

    const exerciseId = randomUUID()
    await client.execute(
      `INSERT INTO exercises (id, workout_id, name, created_at) 
       VALUES (:id, :workoutId, :name, NOW())`,
      { id: exerciseId, workoutId, name }
    )

    return { success: true, exerciseId }
  } catch (error) {
    if ((error as any)?.statusCode === 400 || (error as any)?.statusCode === 404) {
      throw error
    }
    console.error('Error adding exercise:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
