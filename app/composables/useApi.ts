export function useApi() {
  async function request<T>(path: string, options?: RequestInit & { query?: Record<string, any>; body?: any }) {
    try {
      // @ts-ignore
      const res = await $fetch<T>(path, options as any)
      return { data: res, error: null as any }
    } catch (err: any) {
      const status = err?.statusCode || err?.status
      const message = err?.statusMessage || err?.data?.statusMessage || 'Request failed'
      return { data: null as any, error: { status, message } }
    }
  }

  async function get<T>(path: string, query?: Record<string, any>) {
    return request<T>(path, { query })
  }

  async function post<T>(path: string, body?: any, query?: Record<string, any>) {
    return request<T>(path, { method: 'POST', body, query })
  }

  async function del<T>(path: string, query?: Record<string, any>) {
    return request<T>(path, { method: 'DELETE', query })
  }

  async function patch<T>(path: string, body?: any, query?: Record<string, any>) {
    return request<T>(path, { method: 'PATCH', body, query })
  }

  return { get, post, del, patch }
}
