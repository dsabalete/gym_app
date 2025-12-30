<template>
  <UiCard
    :class="['workout-list-item', workout.archived ? 'opacity-60' : '']">
    <template #header>
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-xl font-bold text-white">{{ formatDate(workout.date) }}</h3>
          <p class="text-sm text-gray-400 mt-1">
            {{ workout.exercises.length }} exercises • {{ totalSets }} sets
          </p>
        </div>
        <div class="flex space-x-2">
          <UiButton variant="ghost" size="sm" aria-label="Copy" @click="emit('copy', workout)">
            <span class="inline-flex items-center">
              <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5">
                <rect x="9" y="9" width="10" height="12" rx="2" />
                <rect x="5" y="3" width="10" height="12" rx="2" />
              </svg>
              Copy
            </span>
          </UiButton>
          <UiButton variant="ghost" size="sm" aria-label="Complete" @click="emit('archive', workout.id)">
            <span class="inline-flex items-center">
              <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5">
                <path d="M3 7h18v4H3z" />
                <path d="M5 11v6a2 2 0 0 0 2 2h10a 2 2 0 0 0 2-2v-6" />
                <path d="M10 15h4" />
              </svg>
              Complete
            </span>
          </UiButton>
          <UiButton variant="danger" size="sm" aria-label="Delete" @click="emit('delete', workout.id)">
            <span class="inline-flex items-center">
              <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 3h6m-7 3h8m-9 0v13a2 2 0 0 0 2 2h6a 2 2 0 0 0 2-2V6M10 10v8M14 10v8" />
              </svg>
              Delete
            </span>
          </UiButton>
        </div>
      </div>
    </template>
    <div class="flex flex-wrap gap-2">
      <span v-for="exercise in workout.exercises.slice(0, 6)" :key="exercise.id"
        class="inline-block rounded-full bg-primary/20 text-primary border border-primary/20 text-xs font-semibold px-2 py-1">
        {{ exercise.name }}
      </span>
      <span v-if="workout.exercises.length > 6"
        class="inline-block rounded-full bg-white/5 text-gray-400 border border-white/10 text-xs font-semibold px-2 py-1">
        +{{ workout.exercises.length - 6 }} more
      </span>
    </div>
    <template #footer>
      <div class="flex justify-end items-center space-x-3">
        <span v-if="workout.archived" class="text-primary text-sm font-bold">Completed</span>
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
  (e: 'copy', workout: Workout): void
  (e: 'archive', id: string): void
}>()

const totalSets = computed(() => {
  return props.workout.exercises.reduce((t: number, e) => t + (e.sets?.length ?? 0), 0)
})

function formatDate(dateString: string) {
  return formatDateUTC(dateString)
}
</script>
