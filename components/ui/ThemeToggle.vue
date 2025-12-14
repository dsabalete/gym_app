<template>
  <UiButton variant="ghost" size="sm" @click="toggleTheme" aria-label="Toggle theme">
    <svg v-if="theme === 'light'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="4"></circle>
      <path stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  </UiButton>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'
import { useTheme } from '~/composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>
