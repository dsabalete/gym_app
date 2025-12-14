import { createRdsClient } from '~/server/utils/aws-rds'

export default defineEventHandler(async (event) => {
  try {
    const setId = getRouterParam(event, 'id')
    const userId = getQuery(event).userId as string
    const body = await readBody(event)

    if (!setId || !userId) {
      throw createError({ statusCode: 400, statusMessage: 'Set ID and User ID are required' })
    }

    const fields: Record<string, any> = {}
    if (body?.setNumber !== undefined) fields.set_number = Number(body.setNumber)
    if (body?.reps !== undefined) fields.reps = Number(body.reps)
    if (body?.weight !== undefined) fields.weight = Number(body.weight)

    if (!Object.keys(fields).length) {
      throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
    }

    const client = createRdsClient()

    const verifyRes = await client.execute(
      `SELECT es.id 
       FROM exercise_sets es
       JOIN exercises e ON e.id = es.exercise_id
       JOIN workouts w ON w.id = e.workout_id
       WHERE es.id = :setId AND w.user_id = :userId`,
      { setId, userId }
    )

    if (!verifyRes.records.length) {
      throw createError({ statusCode: 404, statusMessage: 'Set not found' })
    }

    const setClauses = Object.keys(fields).map((k) => `${k} = :${k}`).join(', ')
    await client.execute(
      `UPDATE exercise_sets SET ${setClauses} WHERE id = :id`,
      { ...fields, id: setId }
    )

    return { success: true }
  } catch (error) {
    if ((error as any)?.statusCode === 404 || (error as any)?.statusCode === 400) {
      throw error
    }
    console.error('Error updating set:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
