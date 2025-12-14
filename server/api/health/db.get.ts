import { createRdsClient } from '~/server/utils/aws-rds'

export default defineEventHandler(async () => {
  try {
    const client = createRdsClient()
    const res = await client.execute('SELECT 1 as ok')
    return { ok: true, result: res.records?.[0]?.ok === 1 || res.records?.[0]?.ok === '1' }
  } catch (error) {
    console.error('DB health check failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: process.env.NODE_ENV === 'production' ? 'DB health check failed' : (error as any)?.message || 'DB health check failed'
    })
  }
})
