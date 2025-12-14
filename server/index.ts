import { parse } from 'node:url'
import { createApp, toNodeListener } from 'h3'
import { createNitro } from 'nitropack'

// Create Nitro instance
const nitro = await createNitro({
  preset: 'aws-lambda'
})

await nitro.ready()

// Create H3 app for serverless
const app = createApp()

// Use Nitro's handler
app.use(nitro.h3App.router)

// Export handler for AWS Lambda
export const handler = async (event: any, context: any) => {
  // Convert AWS Lambda event to Node.js request
  const url = `https://${event.headers.Host}${event.requestContext.path}`
  const parsedUrl = parse(url, true)

  const req = {
    url: parsedUrl.pathname + (parsedUrl.search || ''),
    method: event.httpMethod,
    headers: event.headers,
    body: event.body
  }

  const res = {
    statusCode: 200,
    headers: {},
    body: ''
  }

  // Create response handlers
  const setHeader = (name: string, value: string) => {
    (res.headers as Record<string, string>)[name] = value
  }

  const setStatusCode = (code: number) => {
    res.statusCode = code
  }

  const write = (chunk: any) => {
    res.body += chunk
  }

  const end = (chunk?: any) => {
    if (chunk) write(chunk)
    return {
      statusCode: res.statusCode,
      headers: res.headers,
      body: res.body
    }
  }

  // Handle the request
  try {
    const nodeListener = toNodeListener(app)

    // Simulate Node.js request/response
    const result = await new Promise((resolve, reject) => {
      nodeListener(req as any, {
        statusCode: res.statusCode,
        setHeader,
        write,
        end: (chunk?: any) => resolve(end(chunk))
      } as any)
    })

    return result
  } catch (error) {
    console.error('Lambda handler error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}