<template>
  <UiCard class="ui-progress-chart p-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h3 class="text-lg font-bold text-white uppercase tracking-wide">Weekly Progress</h3>
      <div class="flex bg-white/5 p-1 rounded-lg border border-white/5">
        <button v-for="m in metrics" :key="m.id" @click="activeMetric = m.id" :class="[
          'px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wide',
          activeMetric === m.id
            ? 'bg-primary text-background shadow-lg'
            : 'text-gray-400 hover:text-white'
        ]">
          {{ m.label }}
        </button>
      </div>
    </div>

    <div class="relative h-64 flex items-end justify-between gap-2 px-2 mt-8">
      <div v-for="bar in bars" :key="bar.label" class="flex-1 flex flex-col items-center group">
        <div
          class="relative w-full flex items-end justify-center h-48 bg-white/5 rounded-t-lg overflow-hidden border-b border-white/10">
          <div :style="{ height: `${bar.height}%` }"
            class="w-full bg-primary shadow-[0_0_10px_rgba(46,209,108,0.2)] transition-all duration-500 ease-out group-hover:bg-primary-400 group-hover:shadow-[0_0_15px_rgba(46,209,108,0.4)] relative">
            <div class="absolute top-0 left-0 right-0 h-1 bg-white/20"></div>
          </div>
          <!-- Tooltip -->
          <div
            class="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div
              class="bg-background-light text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap shadow-xl border border-primary/20">
              {{ bar.raw }} {{metrics.find(m => m.id === activeMetric)?.label}}
            </div>
          </div>
        </div>
        <p
          class="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider truncate w-full text-center group-hover:text-primary transition-colors">
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
