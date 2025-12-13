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

    const workoutResult = await client.execute(
      `SELECT id, date, created_at 
       FROM workouts 
       WHERE user_id = :userId AND id = :workoutId`,
      { userId, workoutId }
    )

    if (!workoutResult.records.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Workout not found'
      })
    }

    const workoutRow = workoutResult.records[0]
    const workout: any = {
      id: workoutRow.id,
      date: workoutRow.date,
      createdAt: workoutRow.created_at,
      exercises: []
    }

    const exercisesResult = await client.execute(
      `SELECT id, name 
       FROM exercises 
       WHERE workout_id = :workoutId 
       ORDER BY id`,
      { workoutId }
    )

    if (exercisesResult.records.length) {
      for (const exRow of exercisesResult.records) {
        const exercise = {
          id: exRow.id,
          name: exRow.name,
          sets: []
        }
        const setsResult = await client.execute(
          `SELECT id, set_number, reps, weight 
           FROM exercise_sets 
           WHERE exercise_id = :exerciseId 
           ORDER BY set_number`,
          { exerciseId: exRow.id }
        )
        if (setsResult.records.length) {
          exercise.sets = setsResult.records.map((s: any) => ({
            id: s.id,
            setNumber: s.set_number,
            reps: s.reps,
            weight: s.weight
          }))
        }
        workout.exercises.push(exercise)
      }
    }

    return {
      success: true,
      workout
    }
  } catch (error) {
    if ((error as any)?.statusCode === 404) {
      throw error
    }
    console.error('Error fetching workout detail:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
