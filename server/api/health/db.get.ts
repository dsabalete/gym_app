

export default defineEventHandler(async () => {
  try {
    const db = getDb()
    const docRef = db.collection('__health').doc('probe')
    await docRef.set({ ts: Date.now() }, { merge: true })
    const snap = await docRef.get()
    return { ok: true, result: snap.exists }
  } catch (error) {
    console.error('DB health check failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: process.env.NODE_ENV === 'production' ? 'DB health check failed' : (error as any)?.message || 'DB health check failed'
    })
  }
})
