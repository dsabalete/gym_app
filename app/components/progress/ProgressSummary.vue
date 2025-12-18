<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <UiCard v-for="stat in stats" :key="stat.label" class="p-4">
      <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{{ stat.label }}
      </h3>
      <div class="flex items-baseline justify-between">
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stat.value }}</p>
        <span v-if="stat.change !== undefined" :class="[
          'text-xs font-medium px-1.5 py-0.5 rounded-full',
          stat.change >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        ]">
          {{ stat.change >= 0 ? '+' : '' }}{{ stat.change }}%
        </span>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import type { Workout } from '~~/types/workout'

const props = defineProps<{
  workouts: Workout[]
}>()

const stats = computed(() => {
  const now = new Date()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const thisWeekStart = new Date(now.getTime() - weekMs)
  const lastWeekStart = new Date(now.getTime() - 2 * weekMs)

  const thisWeekWorkouts = props.workouts.filter(w => new Date(w.date) >= thisWeekStart)
  const lastWeekWorkouts = props.workouts.filter(w => {
    const d = new Date(w.date)
    return d >= lastWeekStart && d < thisWeekStart
  })

  const getMetrics = (workouts: Workout[]) => {
    let sets = 0
    let reps = 0
    let volume = 0
    workouts.forEach(w => {
      w.exercises.forEach(e => {
        e.sets.forEach(s => {
          if (s.completed) {
            sets++
            reps += s.reps
            volume += s.reps * s.weight
          }
        })
      })
    })
    return {
      count: workouts.length,
      sets,
      reps,
      volume,
      avgSets: workouts.length ? Math.round((sets / workouts.length) * 10) / 10 : 0
    }
  }

  const current = getMetrics(thisWeekWorkouts)
  const previous = getMetrics(lastWeekWorkouts)

  const calculateChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  return [
    {
      label: 'Workouts',
      value: current.count,
      change: calculateChange(current.count, previous.count)
    },
    {
      label: 'Total Sets',
      value: current.sets,
      change: calculateChange(current.sets, previous.sets)
    },
    {
      label: 'Total Volume',
      value: `${current.volume.toLocaleString()}kg`,
      change: calculateChange(current.volume, previous.volume)
    },
    {
      label: 'Avg Sets/Workout',
      value: current.avgSets,
      change: calculateChange(current.avgSets, previous.avgSets)
    }
  ]
})
</script>
