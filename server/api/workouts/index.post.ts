import { getDb, runTransaction } from '~/server/utils/firestore'
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      for (const exercise of exercises) {
        const exerciseId = randomUUID()
        const exerciseRef = workoutRef.collection('exercises').doc(exerciseId)
        tx.set(exerciseRef, {
          id: exerciseId,
          name: exercise.name,
          createdAt: new Date().toISOString()
        })

        for (const set of exercise.sets) {
          const setId = randomUUID()
          const setRef = exerciseRef.collection('sets').doc(setId)
          tx.set(setRef, {
            id: setId,
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            createdAt: new Date().toISOString()
          })
        }
      }
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
