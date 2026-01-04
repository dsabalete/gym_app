export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }
    const db = getDb()
    const userRef = db.collection('users').doc(userId)
    const workoutsSnap = await userRef.collection('workouts').orderBy('date', 'desc').get()
    const workouts = workoutsSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
    const aggregated: Record<string, { name: string; primaryMuscle: string | null; secondaryMuscle: string | null; count: number }> = {}
    for (const w of workouts) {
      let exercises = w.exercises || []
      if (!exercises || exercises.length === 0) {
        const exSnap = await db.collection('users').doc(userId).collection('workouts').doc(w.id).collection('exercises').get()
        exercises = exSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      }
      for (const ex of exercises) {
        const key = String(ex.name || '').trim()
        if (!key) continue
        if (!aggregated[key]) {
          aggregated[key] = { name: key, primaryMuscle: ex.primaryMuscle ?? null, secondaryMuscle: ex.secondaryMuscle ?? null, count: 0 }
        }
        aggregated[key].count += 1
        const pm = ex.primaryMuscle ?? null
        if (pm && aggregated[key].primaryMuscle !== pm) {
          aggregated[key].primaryMuscle = pm
        }
        const sm = ex.secondaryMuscle ?? null
        if (sm && aggregated[key].secondaryMuscle !== sm) {
          aggregated[key].secondaryMuscle = sm
        }
      }
    }
    const exercises = Object.values(aggregated).sort((a, b) => a.name.localeCompare(b.name))
    return { success: true, exercises }
  } catch (error) {
    console.error('Error listing exercises:', error)
    throw createError({
      statusCode: 500,
      statusMessage: process.env.NODE_ENV === 'production' ? 'Internal server error' : (error as any)?.message || 'Internal server error'
    })
  }
})
