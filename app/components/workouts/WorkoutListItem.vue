<template>
  <UiCard class="workout-list-item">
    <template #header>
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-300">{{ formatDate(workout.date) }}</h3>
          <p class="text-sm text-gray-500 mt-1">
            {{ workout.exercises.length }} exercises • {{ totalSets }} sets
          </p>
        </div>
        <div class="flex space-x-2">
          <button @click="emit('delete', workout.id)" class="text-red-600 hover:text-red-700">
            Delete
          </button>
        </div>
      </div>
    </template>
    <div class="flex flex-wrap gap-2">
      <span v-for="exercise in workout.exercises.slice(0, 6)" :key="exercise.id"
        class="inline-block rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs px-2 py-1">
        {{ exercise.name }}
      </span>
      <span v-if="workout.exercises.length > 6"
        class="inline-block rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2 py-1">
        +{{ workout.exercises.length - 6 }} more
      </span>
    </div>
    <template #footer>
      <div class="flex justify-end">
        <NuxtLink :to="`/workouts/${workout.id}`">
          <UiButton variant="secondary">View Details</UiButton>
        </NuxtLink>
      </div>
    </template>
  </UiCard>
</template>

<script setup lang="ts">
import { formatDateUTC } from '~/utils/date'
import type { Workout } from '~~/types/workout'

const props = defineProps<{
  workout: Workout
}>()

const emit = defineEmits<{
  (e: 'delete', id: string): void
}>()

const totalSets = computed(() => {
  return props.workout.exercises.reduce((t: number, e) => t + (e.sets?.length ?? 0), 0)
})

function formatDate(dateString: string) {
  return formatDateUTC(dateString)
}
</script>
