import { searchArchived } from '../../services/workoutsHelpers'
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string
    const limit = parseInt(query.limit as string) || 50
    const offset = parseInt(query.offset as string) || 0
    const q = (query.q as string) || ''
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }
    const db = getDb()
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 50
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0
    const userRef = db.collection('users').doc(userId)
    const workoutsQuery = userRef
      .collection('workouts')
      .where('archiveDate', '>=', '')
      .orderBy('archiveDate', 'desc')
      .limit(safeLimit)
      .offset(safeOffset)
    const snaps = await workoutsQuery.get()
    let workouts = snaps.docs.map((doc) => {
      const data = doc.data() as any
      const exercises = (data.exercises || []).sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999))
      return { id: doc.id, ...data, exercises }
    })
    if (q) {
      workouts = searchArchived(workouts, q)
    }
    return {
      success: true,
      workouts,
      pagination: {
        limit,
        offset,
        total: workouts.length
      }
    }
  } catch (error) {
    console.error('Error fetching archived workouts:', error)
    throw createError({
      statusCode: 500,
      statusMessage: process.env.NODE_ENV === 'production' ? 'Internal server error' : (error as any)?.message || 'Internal server error'
    })
  }
})
