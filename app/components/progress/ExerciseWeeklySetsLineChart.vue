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
    <div v-else class="mt-2">
      <div class="relative w-full h-64 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-full">
          <rect x="0" y="0" :width="svgWidth" :height="svgHeight" fill="transparent"></rect>
          <g>
            <line :x1="paddingLeft" :y1="svgHeight - paddingBottom" :x2="svgWidth - paddingRight"
              :y2="svgHeight - paddingBottom" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
            <line :x1="paddingLeft" :y1="paddingTop" :x2="paddingLeft" :y2="svgHeight - paddingBottom"
              stroke="rgba(255,255,255,0.2)" stroke-width="1" />
          </g>
          <g>
            <template v-for="i in yTicks" :key="`ytick-${i}`">
              <line :x1="paddingLeft" :y1="yToCoord(i)" :x2="svgWidth - paddingRight" :y2="yToCoord(i)"
                stroke="rgba(255,255,255,0.08)" stroke-width="1" />
              <text :x="paddingLeft - 6" :y="yToCoord(i) - 2" text-anchor="end" class="fill-gray-400"
                style="font-size:10px;font-weight:700">{{ i }}</text>
            </template>
          </g>
          <g>
            <template v-for="(lbl, idx) in weekLabels" :key="`x-${idx}`">
              <text :x="xToCoord(idx)" :y="svgHeight - paddingBottom + 12" text-anchor="middle" class="fill-gray-500"
                style="font-size:10px;font-weight:700">{{ lbl }}</text>
            </template>
          </g>
          <g v-for="series in seriesData" :key="series.name">
            <polyline :points="series.points.map(p => `${p.x},${p.y}`).join(' ')" :fill="`none`"
              :stroke="colorFor(series.name)" stroke-width="2" />
            <circle v-for="(p, i) in series.points" :key="`pt-${series.name}-${i}`" :cx="p.x" :cy="p.y" r="2.5"
              :fill="colorFor(series.name)" />
          </g>
        </svg>
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

const svgWidth = 800
const svgHeight = 240
const paddingLeft = 40
const paddingRight = 16
const paddingTop = 20
const paddingBottom = 28

const maxValue = computed(() => {
  const vals: number[] = []
  weeks.value.forEach(w => {
    exerciseNames.value.forEach(n => vals.push(w.totals[n] ?? 0))
  })
  return Math.max(1, ...vals)
})

const yTicks = computed(() => {
  const max = maxValue.value
  const step = Math.max(1, Math.ceil(max / 4))
  const ticks: number[] = []
  for (let v = 0; v <= max; v += step) ticks.push(v)
  if (ticks[ticks.length - 1] !== max) ticks.push(max)
  return ticks
})

function xToCoord(index: number): number {
  const innerW = svgWidth - paddingLeft - paddingRight
  const step = innerW / Math.max(1, weeks.value.length - 1)
  return paddingLeft + index * step
}

function yToCoord(val: number): number {
  const innerH = svgHeight - paddingTop - paddingBottom
  const ratio = maxValue.value ? val / maxValue.value : 0
  return svgHeight - paddingBottom - ratio * innerH
}

const weekLabels = computed(() => weeks.value.map(w => w.label))

const seriesData = computed(() => {
  return exerciseNames.value.map(name => {
    const points = weeks.value.map((w, idx) => {
      const val = w.totals[name] ?? 0
      return { x: xToCoord(idx), y: yToCoord(val), v: val }
    })
    return { name, points }
  })
})
</script>
