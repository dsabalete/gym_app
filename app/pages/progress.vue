<template>
  <div class="px-4 py-6 sm:px-0">
    <LayoutPageHeader title="Progress" />
    <ProgressSummary :workouts="workouts" />
    <ProgressChart :workouts="workouts" :archived-only="archivedOnly" />
    <ProgressWeeklyExercisesList :workouts="workouts" :archived-only="archivedOnly" class="mt-6" />
    <ProgressMuscleWeeklySetsLineChart :workouts="workouts" :archived-only="archivedOnly" class="mt-6" />
    <ProgressMuscleWeeklySetsTable :workouts="workouts" :archived-only="archivedOnly" class="mt-6" />
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useWorkouts } from '~/composables/useWorkouts'

const { workouts, list } = useWorkouts()
const { uid, ready } = useAuth()

const archivedOnly = ref(false)

onMounted(async () => {
  await ready
  if (uid.value) {
    list(uid.value, 100)
  }
})
</script>
