
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

    const db = getDb()
    const workoutId = randomUUID()
    await runTransaction(async (tx) => {
      const userRef = db.collection('users').doc(userId)
      const workoutRef = userRef.collection('workouts').doc(workoutId)

      tx.set(workoutRef, {
        id: workoutId,
        userId,
        date,
        archived: false,
        archiveDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      const flattenedExercises = exercises.map((ex: any, index: number) => ({
        id: randomUUID(),
        name: ex.name,
        order: index,
        createdAt: new Date().toISOString(),
        sets: (ex.sets || []).map((set: any) => ({
          id: randomUUID(),
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight,
          createdAt: new Date().toISOString()
        }))
      }))

      tx.set(workoutRef, {
        id: workoutId,
        userId,
        date,
        archived: false,
        archiveDate: null,
        exercises: flattenedExercises,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    })

    return {
      success: true,
      workoutId
    }
  } catch (error) {
    console.error('Error creating workout:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
