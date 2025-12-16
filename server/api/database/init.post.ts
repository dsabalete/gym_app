

export default defineEventHandler(async (event) => {
  try {
    getDb()
    return { success: true, message: 'Firestore requires no schema initialization' }
  } catch (error) {
    console.error('Error initializing database:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
