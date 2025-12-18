<template>
  <div class="exercises-exercise-item mb-12">
    <UiCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-200">{{ exercise.name }}</h3>
          <div class="flex items-center gap-2">
            <button class="text-gray-500 hover:text-gray-700 disabled:opacity-30" :disabled="isFirst"
              @click="emit('reorder', 'up')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <button class="text-gray-500 hover:text-gray-700 disabled:opacity-30" :disabled="isLast"
              @click="emit('reorder', 'down')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <span class="text-sm text-gray-500 dark:text-gray-200">{{ exercise.sets.length }} sets</span>
            <button class="text-red-600 hover:text-red-700" @click="emit('remove-exercise', exercise)">Remove
              Exercise</button>
          </div>
        </div>
      </template>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Set</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reps</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <SetRow v-for="set in exercise.sets" :key="set.id" :set="set"
              @save="s => emit('save-set', { set: s, exerciseId: exercise.id })"
              @remove="s => emit('remove-set', { set: s, exerciseId: exercise.id })" />
          </tbody>
        </table>
      </div>
      <template #footer>
        <UiButton variant="primary" @click="emit('add-set', exercise)">Add Set</UiButton>
      </template>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import SetRow from './SetRow.vue'
import type { Exercise } from '~~/types/exercise'

defineProps<{
  exercise: Exercise
  isFirst?: boolean
  isLast?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-set', exercise: Exercise): void
  (e: 'save-set', payload: { set: any; exerciseId: string }): void
  (e: 'remove-set', payload: { set: any; exerciseId: string }): void
  (e: 'remove-exercise', exercise: Exercise): void
  (e: 'reorder', direction: 'up' | 'down'): void
}>()
</script>
