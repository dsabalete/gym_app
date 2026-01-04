<template>
  <UiCard class="ui-progress-chart p-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h3 class="text-lg font-bold text-white uppercase tracking-wide">Sets by Exercise (Weekly)</h3>
      <div class="flex flex-wrap gap-2">
        <div v-for="ex in exerciseNames" :key="ex"
          class="flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10">
          <span class="w-3 h-3 rounded-sm" :style="{ backgroundColor: colorFor(ex) }"></span>
          <span class="text-xs font-bold text-gray-300 uppercase tracking-wide">{{ ex }}</span>
        </div>
      </div>
    </div>

    <div v-if="totalAllSets === 0"
      class="h-48 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
      <p class="text-sm text-gray-400 font-bold uppercase tracking-wide">
        No hay datos de sets completados en las últimas semanas
      </p>
    </div>
    <div v-else class="relative h-64 flex items-end justify-between gap-2 px-2 mt-4">
      <div v-for="bar in stackedBars" :key="bar.label" class="flex-1 flex flex-col items-center group">
        <span class="text-[10px] font-bold text-white mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {{ bar.totalRaw }}
        </span>
        <div
          class="relative w-full flex items-end justify-center h-48 bg-white/5 rounded-t-lg overflow-hidden border-b border-white/10">
          <div class="absolute top-0 left-0 right-0 h-1 bg-white/20"></div>
          <div class="w-full flex flex-col justify-end transition-all duration-500 ease-out">
            <div v-for="seg in bar.segments" :key="seg.name" class="w-full transition-opacity"
              :style="{ height: `${seg.height}%`, backgroundColor: colorFor(seg.name) }"></div>
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
import { computeExerciseSetsByWeek } from '~~/app/utils/progress'

const props = defineProps<{
  workouts: Workout[]
  archivedOnly?: boolean
}>()

const weeks = computed(() => {
  const source = (props.archivedOnly ?? true)
    ? props.workouts.filter(w => !!w.archived)
    : props.workouts
  return computeExerciseSetsByWeek(source, 8)
})

const exerciseNames = computed(() => {
  const names = new Set<string>()
  weeks.value.forEach(w => {
    Object.keys(w.totals).forEach(n => names.add(n))
  })
  return Array.from(names).sort()
})

const totalAllSets = computed(() => weeks.value.reduce((acc, w) => acc + w.totalSets, 0))

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function colorFor(name: string): string {
  const h = hashString(name) % 360
  return `hsl(${h}, 55%, 55%)`
}

const stackedBars = computed(() => {
  const maxTotal = Math.max(1, ...weeks.value.map(w => w.totalSets))
  return weeks.value.map(w => {
    const segments = exerciseNames.value.map(name => {
      const count = w.totals[name] ?? 0
      const height = w.totalSets ? Math.round((count / maxTotal) * 100) : 0
      return { name, count, height }
    }).filter(s => s.count > 0)
    return {
      label: w.label,
      totalRaw: w.totalSets.toLocaleString(),
      segments
    }
  })
})
</script>
