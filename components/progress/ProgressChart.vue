<template>
  <UiCard>
    <h3 class="text-md font-medium text-gray-900 mb-4">Workouts Per Week</h3>
    <div class="grid grid-cols-7 gap-2">
      <div v-for="bar in bars" :key="bar.label">
        <div class="h-24 bg-gray-100 rounded flex items-end">
          <div :style="{ height: `${bar.height}%` }" class="w-full bg-primary-500 rounded"></div>
        </div>
        <p class="text-xs text-gray-600 mt-1 text-center">{{ bar.label }}</p>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import UiCard from '~/components/ui/Card.vue'
import type { Workout } from '~/types/workout'

const props = defineProps<{
  workouts: Workout[]
}>()

const bars = computed(() => {
  const now = new Date()
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    const count = props.workouts.filter(w => {
      const wd = new Date(w.date)
      return wd.toDateString() === d.toDateString()
    }).length
    return { label, count }
  })
  const max = Math.max(1, ...days.map(d => d.count))
  return days.map(d => ({ label: d.label, height: Math.round((d.count / max) * 100) }))
})
</script>
