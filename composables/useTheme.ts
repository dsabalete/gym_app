import { onMounted, watch } from 'vue'

type Theme = 'light' | 'dark'

export function useTheme() {
  const theme = useState<Theme>('theme', () => 'light')

  function applyTheme(next: Theme) {
    if (process.client) {
      const root = document.documentElement
      if (next === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  function setTheme(next: Theme) {
    theme.value = next
    if (process.client) {
      localStorage.setItem('theme', next)
    }
    applyTheme(next)
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    if (process.client) {
      const stored = localStorage.getItem('theme') as Theme | null
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial: Theme = stored ?? (prefersDark ? 'dark' : 'light')
      theme.value = initial
      applyTheme(initial)
    }
  })

  watch(theme, (val) => {
    applyTheme(val)
  })

  return {
    theme,
    setTheme,
    toggleTheme
  }
}

