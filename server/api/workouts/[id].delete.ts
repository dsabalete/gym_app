import { createRdsClient } from '~/server/utils/aws-rds'

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

    const client = createRdsClient()
    
    // Start transaction
    await client.execute('BEGIN')
    
    try {
      // Verify the workout belongs to the user
      const verifyResult = await client.execute(
        'SELECT id FROM workouts WHERE id = :workoutId AND user_id = :userId',
        { workoutId, userId }
      )
      
      if (verifyResult.records.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Workout not found'
        })
      }

      // Delete exercise sets first (foreign key constraint)
      await client.execute(
        `DELETE FROM exercise_sets 
         WHERE exercise_id IN (
           SELECT id FROM exercises WHERE workout_id = :workoutId
         )`,
        { workoutId }
      )

      // Delete exercises
      await client.execute(
        'DELETE FROM exercises WHERE workout_id = :workoutId',
        { workoutId }
      )

      // Delete workout
      await client.execute(
        'DELETE FROM workouts WHERE id = :workoutId',
        { workoutId }
      )

      await client.execute('COMMIT')
      
      return {
        success: true,
        message: 'Workout deleted successfully'
      }
    } catch (error) {
      await client.execute('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error deleting workout:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
