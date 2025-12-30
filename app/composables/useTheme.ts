import { onMounted, watch } from 'vue'

type Theme = 'light' | 'dark'

export function useTheme() {
  const theme = useState<Theme>('theme', () => 'dark')

  function applyTheme(next: Theme) {
    if (process.client) {
      const root = document.documentElement
      root.classList.add('dark')
    }
  }

  function setTheme(next: Theme) {
    theme.value = 'dark'
    if (process.client) {
      localStorage.setItem('theme', 'dark')
    }
    applyTheme('dark')
  }

  function toggleTheme() {
    // No-op or reset to dark
    setTheme('dark')
  }

  onMounted(() => {
    if (process.client) {
      theme.value = 'dark'
      applyTheme('dark')
    }
  })

  return {
    theme,
    setTheme,
    toggleTheme
  }
}

