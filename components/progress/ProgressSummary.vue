<template>
  <UiCard>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-200 mb-1">Total Workouts</h3>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ totalWorkouts }}</p>
      </div>
      <div>
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-200 mb-1">This Week</h3>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ thisWeek }}</p>
      </div>
      <div>
        <h3 class="text-xs font-medium text-gray-600 dark:text-gray-200 mb-1">Total Exercises</h3>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ totalExercises }}</p>
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

const totalWorkouts = computed(() => props.workouts.length)
const thisWeek = computed(() => {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return props.workouts.filter(w => new Date(w.date) >= weekAgo).length
})
const totalExercises = computed(() => props.workouts.reduce((t, w) => t + w.exercises.length, 0))
</script>
