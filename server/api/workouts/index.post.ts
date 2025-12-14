import { createRdsClient } from '~/server/utils/aws-rds'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, date, exercises } = body

    if (!userId || !date || !exercises || !Array.isArray(exercises)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }

    const client = createRdsClient()
    const txId = await client.beginTransaction()

    try {
      const workoutId = randomUUID()
      await client.execute(
        `INSERT INTO workouts (id, user_id, date, created_at, updated_at) 
         VALUES (:workoutId, :userId, :date, NOW(), NOW())`,
        { workoutId, userId, date },
        txId
      )

      // Insert exercises and sets
      for (const exercise of exercises) {
        const exerciseId = randomUUID()
        await client.execute(
          `INSERT INTO exercises (id, workout_id, name, created_at) 
           VALUES (:exerciseId, :workoutId, :name, NOW())`,
          { exerciseId, workoutId, name: exercise.name },
          txId
        )

        for (const set of exercise.sets) {
          const setId = randomUUID()
          await client.execute(
            `INSERT INTO exercise_sets (id, exercise_id, set_number, reps, weight, created_at) 
             VALUES (:setId, :exerciseId, :setNumber, :reps, :weight, NOW())`,
            { setId, exerciseId, setNumber: set.setNumber, reps: set.reps, weight: set.weight },
            txId
          )
        }
      }

      await client.commitTransaction(txId)

      return {
        success: true,
        workoutId
      }
    } catch (error) {
      await client.rollbackTransaction(txId)
      throw error
    }
  } catch (error) {
    console.error('Error creating workout:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
