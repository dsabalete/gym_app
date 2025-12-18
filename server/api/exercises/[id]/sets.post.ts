
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const exerciseId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string
    const body = await readBody(event)
    const workoutId = body?.workoutId as string | undefined
    const reps = Number(body?.reps ?? 0)
    const weight = Number(body?.weight ?? 0)
    const setNumberInput = body?.setNumber

    if (!exerciseId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Exercise ID and User ID are required' })
    }

    const db = getDb()
    let workoutRef: FirebaseFirestore.DocumentReference
    let exerciseRef: FirebaseFirestore.DocumentReference

    if (!workoutId) {
      // Slow fallback: search all workouts for the exercise
      const workoutsSnap = await db.collection('users').doc(userId).collection('workouts').get()
      const foundWorkout = workoutsSnap.docs.find(doc => {
        const data = doc.data()
        return (data.exercises || []).some((ex: any) => ex.id === exerciseId)
      })
      if (!foundWorkout) {
        throw createError({ statusCode: 404, statusMessage: 'Exercise not found in any workout' })
      }
      workoutRef = foundWorkout.ref
    } else {
      workoutRef = db.collection('users').doc(userId).collection('workouts').doc(workoutId)
    }

    const workoutDoc = await workoutRef.get()
    if (!workoutDoc.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Workout not found' })
    }

    const data = workoutDoc.data()
    const exercises = [...(data?.exercises || [])]
    const exIndex = exercises.findIndex((ex: any) => ex.id === exerciseId)
    if (exIndex === -1) {
      throw createError({ statusCode: 404, statusMessage: 'Exercise not found in workout' })
    }

    const exercise = exercises[exIndex]!
    const nextNumber = (exercise.sets || []).length + 1
    const setId = randomUUID()
    const newSet = {
      id: setId,
      setNumber: Number.isFinite(Number(setNumberInput)) ? Number(setNumberInput) : nextNumber,
      reps,
      weight,
      createdAt: new Date().toISOString()
    }

    exercise.sets = [...(exercise.sets || []), newSet]
    exercises[exIndex] = exercise

    await workoutRef.update({
      exercises,
      updatedAt: new Date().toISOString()
    })

    return { success: true, setId }
  } catch (error) {
    if ((error as any)?.statusCode === 404) {
      throw error
    }
    console.error('Error adding set:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
