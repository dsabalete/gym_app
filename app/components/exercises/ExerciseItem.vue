<template>
  <UiCard class="exercises-exercise-item">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-200">{{ exercise.name }}</h3>
        <div class="flex items-center gap-2">
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
</template>

<script setup lang="ts">
import SetRow from './SetRow.vue'
import type { Exercise } from '~~/types/exercise'

defineProps<{
  exercise: Exercise
}>()

const emit = defineEmits<{
  (e: 'add-set', exercise: Exercise): void
  (e: 'save-set', payload: { set: any; exerciseId: string }): void
  (e: 'remove-set', set: any): void
  (e: 'remove-exercise', exercise: Exercise): void
}>()
</script>
