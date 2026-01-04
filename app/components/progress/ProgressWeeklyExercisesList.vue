<template>
  <UiCard class="ui-weekly-exercises p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-white uppercase tracking-wide">All Exercises (Weekly Sets)</h3>
    </div>

    <div v-if="isEmpty" class="h-32 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
      <p class="text-sm text-gray-400 font-bold uppercase tracking-wide">
        No exercises found in database
      </p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr>
            <th class="text-left px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-400">Exercise</th>
            <th v-for="(lbl, i) in weekLabels" :key="`wk-${i}`"
              class="px-2 py-2 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">
              {{ lbl }}
            </th>
            <th class="px-2 py-2 text-xs font-bold uppercase tracking-wide text-gray-400 text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rIndex) in tableData" :key="exerciseNames[rIndex]"
            class="border-t border-white/10 hover:bg-white/5 transition-colors">
            <td class="px-3 py-2 font-semibold text-white">
              <span class="inline-flex items-center gap-2">
                <span class="w-3 h-3 rounded-sm"
                  :style="{ backgroundColor: colorFor(exerciseNames[rIndex] ?? '') }"></span>
                {{ exerciseNames[rIndex] }}
              </span>
            </td>
            <td v-for="(val, cIndex) in row" :key="`cell-${rIndex}-${cIndex}`"
              class="px-2 py-2 text-center text-white/90">
              <span :class="{ 'text-gray-600': val === 0, 'text-white font-bold': val > 0 }">{{ val }}</span>
            </td>
            <td class="px-2 py-2 text-center font-bold text-white">
              {{row.reduce((a, b) => a + b, 0)}}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import type { Workout } from '~~/types/workout'
import { computeAllExercisesWeeklyTable } from '~~/app/utils/progressTable'

const props = defineProps<{
  workouts: Workout[]
  archivedOnly?: boolean
}>()

const table = computed(() => computeAllExercisesWeeklyTable(props.workouts, 8, props.archivedOnly ?? false))
const weekLabels = computed(() => table.value.weekLabels)
const exerciseNames = computed(() => table.value.exerciseNames)
const tableData = computed(() => table.value.data)
const isEmpty = computed(() => exerciseNames.value.length === 0)

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
</script>
