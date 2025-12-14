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
    const txId = await client.beginTransaction()

    try {
      let targetWorkoutId = workoutId

      const workoutLookup = await client.execute(
        'SELECT id, user_id FROM workouts WHERE id = :id',
        { id: targetWorkoutId },
        txId
      )

      if (!workoutLookup.records.length) {
        const exerciseLookup = await client.execute(
          'SELECT workout_id FROM exercises WHERE id = :id',
          { id: targetWorkoutId },
          txId
        )

        if (!exerciseLookup.records.length) {
          const setLookup = await client.execute(
            'SELECT exercise_id FROM exercise_sets WHERE id = :id',
            { id: targetWorkoutId },
            txId
          )

          if (!setLookup.records.length) {
            throw createError({
              statusCode: 404,
              statusMessage: 'Workout not found'
            })
          }

          const exerciseId = setLookup.records[0].exercise_id
          const exerciseToWorkout = await client.execute(
            'SELECT workout_id FROM exercises WHERE id = :exerciseId',
            { exerciseId },
            txId
          )

          if (!exerciseToWorkout.records.length) {
            throw createError({
              statusCode: 404,
              statusMessage: 'Workout not found'
            })
          }

          targetWorkoutId = exerciseToWorkout.records[0].workout_id
        } else {
          targetWorkoutId = exerciseLookup.records[0].workout_id
        }
      }

      const verifyResult = await client.execute(
        'SELECT id, user_id FROM workouts WHERE id = :workoutId',
        { workoutId: targetWorkoutId },
        txId
      )

      if (verifyResult.records.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Workout not found'
        })
      }

      const ownerId = verifyResult.records[0].user_id
      if (ownerId !== userId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Workout belongs to a different user'
        })
      }

      // Delete exercise sets first (foreign key constraint)
      await client.execute(
        `DELETE FROM exercise_sets 
         WHERE exercise_id IN (
           SELECT id FROM exercises WHERE workout_id = :workoutId
         )`,
        { workoutId: targetWorkoutId },
        txId
      )

      // Delete exercises
      await client.execute(
        'DELETE FROM exercises WHERE workout_id = :workoutId',
        { workoutId: targetWorkoutId },
        txId
      )

      // Delete workout
      await client.execute(
        'DELETE FROM workouts WHERE id = :workoutId',
        { workoutId: targetWorkoutId },
        txId
      )

      await client.commitTransaction(txId)

      return {
        success: true,
        message: 'Workout deleted successfully'
      }
    } catch (error) {
      await client.rollbackTransaction(txId)
      throw error
    }
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
