export default defineEventHandler(async (event) => {
  try {
    const nameParamRaw = getRouterParam(event, 'name') || ''
    const body = await readBody(event)
    const userId = getQuery(event).userId as string
    const primaryMuscleRaw = String(body?.primaryMuscle || '').trim()
    const primaryMuscle = primaryMuscleRaw.length > 0 ? primaryMuscleRaw : null
    const secondaryMuscleRaw = String(body?.secondaryMuscle || '').trim()
    const secondaryMuscle = secondaryMuscleRaw.length > 0 ? secondaryMuscleRaw : null
    function normalizeName(s: string) {
      return String(s || '').normalize('NFKC').trim()
    }
    let decoded = ''
    try {
      decoded = decodeURIComponent(String(nameParamRaw))
    } catch {
      decoded = String(nameParamRaw)
    }
    const targetName = normalizeName(decoded || String(body?.name || ''))
    if (!userId || !targetName) {
      throw createError({ statusCode: 400, statusMessage: 'User ID and exercise name are required' })
    }
    const db = getDb()
    const userRef = db.collection('users').doc(userId)
    const workoutsSnap = await userRef.collection('workouts').get()
    const updates: { workoutId: string; updated: number }[] = []
    for (const workoutDoc of workoutsSnap.docs) {
      const w = workoutDoc.data() as any
      if (w.archived === true) continue
      let changed = 0
      if (Array.isArray(w.exercises) && w.exercises.length > 0) {
        const newExercises = (w.exercises || []).map((ex: any) => {
          if (normalizeName(String(ex.name || '')) === targetName) {
            changed++
            return { ...ex, primaryMuscle, secondaryMuscle }
          }
          return ex
        })
        if (changed > 0) {
          await workoutDoc.ref.update({ exercises: newExercises, updatedAt: new Date().toISOString() })
          updates.push({ workoutId: workoutDoc.id, updated: changed })
        }
      } else {
        const exSnap = await workoutDoc.ref.collection('exercises').get()
        for (const exDoc of exSnap.docs) {
          const exData = exDoc.data() as any
          if (normalizeName(String(exData.name || '')) === targetName) {
            await exDoc.ref.update({ primaryMuscle, secondaryMuscle, updatedAt: new Date().toISOString() })
            changed++
          }
        }
        if (changed > 0) {
          await workoutDoc.ref.update({ updatedAt: new Date().toISOString() })
          updates.push({ workoutId: workoutDoc.id, updated: changed })
        }
      }
    }
    return { success: true, updates }
  } catch (error) {
    if ((error as any)?.statusCode === 400) {
      throw error
    }
    console.error('Error updating primary muscle:', error)
    throw createError({
      statusCode: 500,
      statusMessage: process.env.NODE_ENV === 'production' ? 'Internal server error' : (error as any)?.message || 'Internal server error'
    })
  }
})
