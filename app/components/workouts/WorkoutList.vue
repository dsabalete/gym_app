<template>
  <div class="workout-list space-y-4">
    <div v-if="loading" class="text-center py-8">
      <UiSkeleton class="mx-auto" width="200px" height="20px" />
      <p class="text-gray-500 mt-2">Loading workouts...</p>
    </div>
    <WorkoutsEmptyState v-else-if="workouts.length === 0" />
    <WorkoutListItem v-else v-for="w in workouts" :key="w.id" :workout="w" @delete="onDelete" @copy="onCopy" />
  </div>
  <slot name="actions" />
</template>

<script setup lang="ts">
import WorkoutsEmptyState from './WorkoutsEmptyState.vue'
import WorkoutListItem from './WorkoutListItem.vue'
import UiSkeleton from '~/components/ui/Skeleton.vue'

const props = defineProps<{
  workouts: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'delete', id: string): void
  (e: 'copy', workout: any): void
}>()

function onDelete(id: string) {
  emit('delete', id)
}

function onCopy(workout: any) {
  emit('copy', workout)
}
</script>
