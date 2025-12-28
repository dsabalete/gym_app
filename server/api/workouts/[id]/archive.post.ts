export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const body = await readBody(event)
    const userId = (query.userId as string) || (body?.userId as string)
    const id = event.context.params?.id as string
    if (!userId || !id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID and workout ID are required'
      })
    }
    const db = getDb()
    const userRef = db.collection('users').doc(userId)
    const workoutRef = userRef.collection('workouts').doc(id)
    const snap = await workoutRef.get()
    if (!snap.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Workout not found' })
    }
    const data = snap.data() as any
    if (data.userId !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Not authorized' })
    }
    const now = new Date().toISOString()
    await workoutRef.update({
      archived: true,
      archiveDate: now,
      updatedAt: now
    })
    return { success: true }
  } catch (error) {
    console.error('Error archiving workout:', error)
    throw createError({
      statusCode: 500,
      statusMessage: process.env.NODE_ENV === 'production' ? 'Internal server error' : (error as any)?.message || 'Internal server error'
    })
  }
})
