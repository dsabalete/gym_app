export function useDebounce<T extends (...args: any[]) => any>(fn: T, wait = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: any[] | null = null
  const debounced = (...args: any[]) => {
    lastArgs = args
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = null
      const a = lastArgs || []
      lastArgs = null
      fn(...a)
    }, wait)
  }
  return debounced as (...args: Parameters<T>) => void
}
