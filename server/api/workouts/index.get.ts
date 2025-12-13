import { createRdsClient } from '~/server/utils/aws-rds'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string
    const limit = parseInt(query.limit as string) || 50
    const offset = parseInt(query.offset as string) || 0

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const client = createRdsClient()

    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 50
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0

    const result = await client.execute(
      `SELECT 
         w.id, w.date, w.created_at,
         e.id as exercise_id, e.name as exercise_name,
         es.id as set_id, es.set_number, es.reps, es.weight
       FROM workouts w
       LEFT JOIN exercises e ON w.id = e.workout_id
       LEFT JOIN exercise_sets es ON e.id = es.exercise_id
       WHERE w.user_id = :userId
       ORDER BY w.date DESC, e.id, es.set_number
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      { userId }
    )

    // Group the results by workout and exercise
    const workouts = new Map()

    result.records.forEach((row: any) => {
      const workoutId = row.id

      if (!workouts.has(workoutId)) {
        workouts.set(workoutId, {
          id: workoutId,
          date: row.date,
          createdAt: row.created_at,
          exercises: []
        })
      }

      const workout = workouts.get(workoutId)

      if (row.exercise_id) {
        let exercise = workout.exercises.find((e: any) => e.id === row.exercise_id)

        if (!exercise) {
          exercise = {
            id: row.exercise_id,
            name: row.exercise_name,
            sets: []
          }
          workout.exercises.push(exercise)
        }

        if (row.set_id) {
          exercise.sets.push({
            id: row.set_id,
            setNumber: row.set_number,
            reps: row.reps,
            weight: row.weight
          })
        }
      }
    })

    return {
      success: true,
      workouts: Array.from(workouts.values()),
      pagination: {
        limit,
        offset,
        total: workouts.size
      }
    }
  } catch (error) {
    console.error('Error fetching workouts:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
