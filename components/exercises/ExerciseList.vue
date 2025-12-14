<template>
  <div class="exercises-exercise-list space-y-4">
    <ExerciseItem v-for="ex in exercises" :key="ex.id" :exercise="ex" @add-set="e => emit('add-set', e)"
      @save-set="s => emit('save-set', s)" @remove-set="s => emit('remove-set', s)"
      @remove-exercise="e => emit('remove-exercise', e)" />
  </div>
</template>

<script setup lang="ts">
import ExerciseItem from './ExerciseItem.vue'
import type { Exercise } from '~/types/exercise'

defineProps<{
  exercises: Exercise[]
}>()

const emit = defineEmits<{
  (e: 'add-set', exercise: Exercise): void
  (e: 'save-set', set: any): void
  (e: 'remove-set', set: any): void
  (e: 'remove-exercise', exercise: Exercise): void
}>()
</script>
