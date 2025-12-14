import { createRdsClient } from '~/server/utils/aws-rds'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const exerciseId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string
    const body = await readBody(event)
    const reps = Number(body?.reps ?? 0)
    const weight = Number(body?.weight ?? 0)
    const setNumberInput = body?.setNumber

    if (!exerciseId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Exercise ID and User ID are required' })
    }

    const client = createRdsClient()
    const txId = await client.beginTransaction()

    try {
      const exRes = await client.execute(
        `SELECT e.id, w.user_id 
         FROM exercises e 
         JOIN workouts w ON w.id = e.workout_id 
         WHERE e.id = :exerciseId AND w.user_id = :userId`,
        { exerciseId, userId },
        txId
      )

      if (!exRes.records.length) {
        throw createError({ statusCode: 404, statusMessage: 'Exercise not found' })
      }

      const nextRes = await client.execute(
        `SELECT COALESCE(MAX(set_number), 0) + 1 AS next 
         FROM exercise_sets 
         WHERE exercise_id = :exerciseId`,
        { exerciseId },
        txId
      )

      const nextNumber = nextRes.records?.[0]?.next ?? 1
      const setNumber = Number.isFinite(Number(setNumberInput)) && Number(setNumberInput) > 0 ? Number(setNumberInput) : nextNumber

      const setId = randomUUID()
      await client.execute(
        `INSERT INTO exercise_sets (id, exercise_id, set_number, reps, weight, created_at) 
         VALUES (:id, :exerciseId, :setNumber, :reps, :weight, NOW())`,
        { id: setId, exerciseId, setNumber, reps, weight },
        txId
      )

      await client.commitTransaction(txId)

      return { success: true, setId }
    } catch (error) {
      await client.rollbackTransaction(txId)
      throw error
    }
  } catch (error) {
    if ((error as any)?.statusCode === 404) {
      throw error
    }
    console.error('Error adding set:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
