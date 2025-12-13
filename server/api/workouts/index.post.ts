import { createRdsClient } from '~/server/utils/aws-rds'

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
    
    // Start transaction
    await client.execute('BEGIN')
    
    try {
      // Insert workout
      const workoutResult = await client.execute(
        `INSERT INTO workouts (user_id, date, created_at, updated_at) 
         VALUES (:userId, :date, NOW(), NOW()) 
         RETURNING id`,
        { userId, date }
      )
      
      const workoutId = workoutResult.records[0].id
      
      // Insert exercises and sets
      for (const exercise of exercises) {
        const exerciseResult = await client.execute(
          `INSERT INTO exercises (workout_id, name, created_at) 
           VALUES (:workoutId, :name, NOW()) 
           RETURNING id`,
          { workoutId, name: exercise.name }
        )
        
        const exerciseId = exerciseResult.records[0].id
        
        for (const set of exercise.sets) {
          await client.execute(
            `INSERT INTO exercise_sets (exercise_id, set_number, reps, weight, created_at) 
             VALUES (:exerciseId, :setNumber, :reps, :weight, NOW())`,
            { exerciseId, setNumber: set.setNumber, reps: set.reps, weight: set.weight }
          )
        }
      }
      
      await client.execute('COMMIT')
      
      return {
        success: true,
        workoutId
      }
    } catch (error) {
      await client.execute('ROLLBACK')
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
