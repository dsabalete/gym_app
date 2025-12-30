<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <UiCard v-for="stat in stats" :key="stat.label"
      class="p-4 border-l-4 border-l-primary/50 hover:border-l-primary transition-all duration-300 group">
      <h3
        class="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider group-hover:text-primary transition-colors">
        {{ stat.label }}
      </h3>
      <div class="flex items-baseline justify-between">
        <p class="text-2xl font-extrabold text-white tracking-tight">{{ stat.value }}</p>
        <span v-if="stat.change !== undefined" :class="[
          'text-xs font-bold px-1.5 py-0.5 rounded-full border',
          stat.change >= 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
        ]">
          {{ stat.change >= 0 ? '+' : '' }}{{ stat.change }}%
        </span>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import type { Workout } from '~~/types/workout'
import { getUTCStartOfWeek } from '~~/app/utils/date'

const props = defineProps<{
  workouts: Workout[]
}>()

const stats = computed(() => {
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const thisWeekStart = getUTCStartOfWeek(new Date(), 1)
  const lastWeekStart = new Date(thisWeekStart.getTime() - weekMs)

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
