import { getDb, runTransaction } from '~/server/utils/firestore'

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

  const db = getDb()
  try {
    let workoutId: string = ''
    await runTransaction(async (tx) => {
      const userRef = db.collection('users').doc(userId)
      tx.set(userRef, { id: userId, email, name, updatedAt: new Date().toISOString() }, { merge: true })

      workoutId = crypto.randomUUID()
      const workoutRef = userRef.collection('workouts').doc(workoutId)
      tx.set(workoutRef, { id: workoutId, userId, date, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })

      for (const ex of exercises) {
        const exerciseId = crypto.randomUUID()
        const exerciseRef = workoutRef.collection('exercises').doc(exerciseId)
        tx.set(exerciseRef, { id: exerciseId, name: ex.name, createdAt: new Date().toISOString() })
        for (const set of ex.sets) {
          const setId = crypto.randomUUID()
          const setRef = exerciseRef.collection('sets').doc(setId)
          tx.set(setRef, { id: setId, setNumber: set.setNumber, reps: set.reps, weight: set.weight, createdAt: new Date().toISOString() })
        }
      }
    })
    return { success: true, userId, workoutId, exercisesCount: exercises.length }
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: process.env.NODE_ENV === 'production' ? 'Internal server error' : (e as any)?.message || 'Internal server error'
    })
  }
})
