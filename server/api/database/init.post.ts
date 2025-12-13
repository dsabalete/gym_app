import { createRdsClient } from '~/server/utils/aws-rds'

export default defineEventHandler(async (event) => {
  try {
    const client = createRdsClient()
    const indexExists = async (table: string, indexName: string) => {
      const res = await client.execute(`
        SELECT index_name
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = '${table}'
          AND index_name = '${indexName}'
        LIMIT 1
      `)
      return Array.isArray(res.records) && res.records.length > 0
    }

    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create workouts table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS workouts (
        id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Create exercises table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS exercises (
        id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
        workout_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
      )
    `)

    // Create exercise_sets table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS exercise_sets (
        id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
        exercise_id VARCHAR(255) NOT NULL,
        set_number INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        weight DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
      )
    `)

    if (!(await indexExists('workouts', 'idx_workouts_user_id'))) {
      await client.execute(`CREATE INDEX idx_workouts_user_id ON workouts(user_id)`)
    }
    if (!(await indexExists('workouts', 'idx_workouts_date'))) {
      await client.execute(`CREATE INDEX idx_workouts_date ON workouts(date)`)
    }
    if (!(await indexExists('exercises', 'idx_exercises_workout_id'))) {
      await client.execute(`CREATE INDEX idx_exercises_workout_id ON exercises(workout_id)`)
    }
    if (!(await indexExists('exercise_sets', 'idx_exercise_sets_exercise_id'))) {
      await client.execute(`CREATE INDEX idx_exercise_sets_exercise_id ON exercise_sets(exercise_id)`)
    }

    return {
      success: true,
      message: 'Database initialized successfully'
    }
  } catch (error) {
    console.error('Error initializing database:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
