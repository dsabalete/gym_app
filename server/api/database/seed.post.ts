import { createRdsClient } from '~/server/utils/aws-rds'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userId = body?.userId || 'user123'
  const email = body?.email || `${userId}@example.com`
  const name = body?.name || 'Test User'
  const date = body?.date || '2025-01-01'
  const exercises = body?.exercises || [
    {
      name: 'Bench Press',
      sets: [
        { setNumber: 1, reps: 8, weight: 80 },
        { setNumber: 2, reps: 8, weight: 80 },
        { setNumber: 3, reps: 6, weight: 85 }
      ]
    },
    {
      name: 'Squat',
      sets: [
        { setNumber: 1, reps: 5, weight: 100 },
        { setNumber: 2, reps: 5, weight: 100 },
        { setNumber: 3, reps: 5, weight: 100 }
      ]
    },
    {
      name: 'Deadlift',
      sets: [
        { setNumber: 1, reps: 5, weight: 120 },
        { setNumber: 2, reps: 5, weight: 120 }
      ]
    }
  ]

  const client = createRdsClient()
  await client.execute('BEGIN')
  try {
    await client.execute(
      'INSERT INTO users (id, email, name, created_at, updated_at) VALUES (:id, :email, :name, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW()',
      { id: userId, email, name }
    )

    const workoutId = crypto.randomUUID()
    await client.execute(
      'INSERT INTO workouts (id, user_id, date, created_at, updated_at) VALUES (:id, :userId, :date, NOW(), NOW())',
      { id: workoutId, userId, date }
    )

    for (const ex of exercises) {
      const exerciseId = crypto.randomUUID()
      await client.execute(
        'INSERT INTO exercises (id, workout_id, name, created_at) VALUES (:id, :workoutId, :name, NOW())',
        { id: exerciseId, workoutId, name: ex.name }
      )

      for (const set of ex.sets) {
        await client.execute(
          'INSERT INTO exercise_sets (exercise_id, set_number, reps, weight, created_at) VALUES (:exerciseId, :setNumber, :reps, :weight, NOW())',
          { exerciseId, setNumber: set.setNumber, reps: set.reps, weight: set.weight }
        )
      }
    }

    await client.execute('COMMIT')
    return {
      success: true,
      userId,
      workoutId,
      exercisesCount: exercises.length
    }
  } catch (e) {
    await client.execute('ROLLBACK')
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
