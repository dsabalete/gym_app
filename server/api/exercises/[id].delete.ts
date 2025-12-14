import { createRdsClient } from '~/server/utils/aws-rds'

export default defineEventHandler(async (event) => {
  try {
    const exerciseId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string

    if (!exerciseId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Exercise ID and User ID are required' })
    }

    const client = createRdsClient()

    const verify = await client.execute(
      `SELECT e.id 
       FROM exercises e 
       JOIN workouts w ON w.id = e.workout_id 
       WHERE e.id = :id AND w.user_id = :userId`,
      { id: exerciseId, userId }
    )
    if (!verify.records.length) {
      throw createError({ statusCode: 404, statusMessage: 'Exercise not found' })
    }

    await client.execute(
      `DELETE FROM exercises WHERE id = :id`,
      { id: exerciseId }
    )

    return { success: true }
  } catch (error) {
    if ((error as any)?.statusCode === 400 || (error as any)?.statusCode === 404) {
      throw error
    }
    console.error('Error deleting exercise:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
