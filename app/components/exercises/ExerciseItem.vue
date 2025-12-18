<template>
  <div class="exercises-exercise-item mb-12">
    <UiCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="isCollapsed = !isCollapsed"
              class="text-gray-500 hover:text-gray-700 transition-transform duration-200"
              :class="{ '-rotate-90': isCollapsed }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-200">{{ exercise.name }}</h3>
              <span v-if="allSetsCompleted"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
                Completed
              </span>
            </div>
          </div>
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
            <button class="text-red-600 hover:text-red-700 ml-2"
              @click="emit('remove-exercise', exercise)">Remove</button>
          </div>
        </div>
      </template>
      <div v-show="!isCollapsed">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Done</th>
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
        <div class="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <UiButton variant="primary" @click="emit('add-set', exercise)">Add Set</UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import SetRow from './SetRow.vue'
import type { Exercise } from '~~/types/exercise'
import { useUiStore } from '~/stores/uiStore'

const props = defineProps<{
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

const uiStore = useUiStore()

const isCollapsed = computed({
  get: () => uiStore.isCollapsed(props.exercise.id),
  set: () => uiStore.toggleCollapse(props.exercise.id)
})

const allSetsCompleted = computed(() => {
  return props.exercise.sets.length > 0 && props.exercise.sets.every(set => set.completed)
})
</script>
