<template>
  <div class="exercises-exercise-list">
    <ExerciseItem v-for="(ex, index) in exercises" :key="ex.id" :exercise="ex" :is-first="index === 0"
      :is-last="index === exercises.length - 1" @add-set="e => emit('add-set', e)" @save-set="s => emit('save-set', s)"
      @remove-set="p => emit('remove-set', p)" @remove-exercise="e => emit('remove-exercise', e)"
      @reorder="d => emit('reorder-exercise', { exercise: ex, index, direction: d })" />
  </div>
</template>

<script setup lang="ts">
import ExerciseItem from './ExerciseItem.vue'
import type { Exercise } from '~~/types/exercise'

defineProps<{
  exercises: Exercise[]
}>()

const emit = defineEmits<{
  (e: 'add-set', exercise: Exercise): void
  (e: 'save-set', payload: { set: any; exerciseId: string }): void
  (e: 'remove-set', payload: { set: any; exerciseId: string }): void
  (e: 'remove-exercise', exercise: Exercise): void
  (e: 'reorder-exercise', payload: { exercise: Exercise; index: number; direction: 'up' | 'down' }): void
}>()
</script>
