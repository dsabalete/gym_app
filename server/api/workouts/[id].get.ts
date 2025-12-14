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

    let targetWorkoutId = workoutId

    const wRes = await client.execute(
      `SELECT id, user_id, date, created_at 
       FROM workouts 
       WHERE id = :id`,
      { id: targetWorkoutId }
    )

    if (!wRes.records.length) {
      const exRes = await client.execute(
        `SELECT e.workout_id 
         FROM exercises e 
         WHERE e.id = :id`,
        { id: targetWorkoutId }
      )

      if (!exRes.records.length) {
        const setRes = await client.execute(
          `SELECT es.exercise_id 
           FROM exercise_sets es 
           WHERE es.id = :id`,
          { id: targetWorkoutId }
        )

        if (!setRes.records.length) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Workout not found'
          })
        }

        const exerciseId = setRes.records[0].exercise_id
        const exToW = await client.execute(
          `SELECT workout_id FROM exercises WHERE id = :exerciseId`,
          { exerciseId }
        )
        if (!exToW.records.length) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Workout not found'
          })
        }
        targetWorkoutId = exToW.records[0].workout_id
      } else {
        targetWorkoutId = exRes.records[0].workout_id
      }
    }

    const workoutResult = await client.execute(
      `SELECT id, date, created_at 
       FROM workouts 
       WHERE user_id = :userId AND id = :workoutId`,
      { userId, workoutId: targetWorkoutId }
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
      { workoutId: targetWorkoutId }
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
