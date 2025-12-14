import { createRdsClient } from '~/server/utils/aws-rds'

export default defineEventHandler(async (event) => {
  try {
    const setId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string

    if (!setId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Set ID and User ID are required' })
    }

    const client = createRdsClient()

    const verifyRes = await client.execute(
      `SELECT es.id 
       FROM exercise_sets es
       JOIN exercises e ON e.id = es.exercise_id
       JOIN workouts w ON w.id = e.workout_id
       WHERE es.id = :setId AND w.user_id = :userId`,
      { setId, userId }
    )

    if (!verifyRes.records.length) {
      throw createError({ statusCode: 404, statusMessage: 'Set not found' })
    }

    await client.execute(
      `DELETE FROM exercise_sets WHERE id = :id`,
      { id: setId }
    )

    return { success: true }
  } catch (error) {
    if ((error as any)?.statusCode === 404 || (error as any)?.statusCode === 400) {
      throw error
    }
    console.error('Error deleting set:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
