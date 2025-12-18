<template>
  <UiCard class="ui-progress-chart p-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h3 class="text-md font-semibold text-gray-900 dark:text-gray-100">Weekly Progress</h3>
      <div class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button v-for="m in metrics" :key="m.id" @click="activeMetric = m.id" :class="[
          'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
          activeMetric === m.id
            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        ]">
          {{ m.label }}
        </button>
      </div>
    </div>

    <div class="relative h-64 flex items-end justify-between gap-2 px-2">
      <div v-for="bar in bars" :key="bar.label" class="flex-1 flex flex-col items-center group">
        <div
          class="relative w-full flex items-end justify-center h-48 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg overflow-hidden">
          <div :style="{ height: `${bar.height}%` }"
            class="w-full bg-primary-500/80 dark:bg-primary-600/80 transition-all duration-500 ease-out group-hover:bg-primary-500">
          </div>
          <!-- Tooltip -->
          <div
            class="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div class="bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl">
              {{ bar.raw }} {{metrics.find(m => m.id === activeMetric)?.label}}
            </div>
          </div>
        </div>
        <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium truncate w-full text-center">
          {{ bar.label }}
        </p>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import type { Workout } from '~~/types/workout'

const props = defineProps<{
  workouts: Workout[]
}>()

const activeMetric = ref('volume')
const metrics = [
  { id: 'workouts', label: 'Workouts' },
  { id: 'sets', label: 'Sets' },
  { id: 'reps', label: 'Reps' },
  { id: 'volume', label: 'Volume' }
]

const bars = computed(() => {
  const now = new Date()
  const weekMs = 7 * 24 * 60 * 60 * 1000

  // Last 8 weeks
  const weeks = Array.from({ length: 8 }).map((_, i) => {
    const start = new Date(now.getTime() - (7 - i) * weekMs)
    const end = new Date(start.getTime() + weekMs)

    // Label as "MM/DD"
    const label = `${start.getMonth() + 1}/${start.getDate()}`

    const weekWorkouts = props.workouts.filter(w => {
      const d = new Date(w.date)
      return d >= start && d < end
    })

    let value = 0
    if (activeMetric.value === 'workouts') {
      value = weekWorkouts.length
    } else {
      weekWorkouts.forEach(w => {
        w.exercises.forEach(e => {
          e.sets.forEach(s => {
            if (s.completed) {
              if (activeMetric.value === 'sets') value++
              else if (activeMetric.value === 'reps') value += s.reps
              else if (activeMetric.value === 'volume') value += s.reps * s.weight
            }
          })
        })
      })
    }

    return { label, value }
  })

  const max = Math.max(1, ...weeks.map(w => w.value))
  return weeks.map(w => ({
    label: w.label,
    raw: w.value.toLocaleString(),
    height: Math.round((w.value / max) * 100)
  }))
})
</script>
