<template>
  <div class="px-4 py-6 sm:px-0">
    <LayoutPageHeader title="Progress" />
    <ProgressSummary :workouts="workouts" />
    <ProgressChart :workouts="workouts" :archived-only="archivedOnly" />
    <ProgressWeeklyExercisesList :workouts="workouts" :archived-only="archivedOnly" class="mt-6" />
    <ProgressExerciseWeeklySetsLineChart :workouts="workouts" :archived-only="archivedOnly" class="mt-6" />
    <ProgressExerciseWeeklySetsTable :workouts="workouts" :archived-only="archivedOnly" class="mt-6" />
    <div class="flex bg-white/5 p-1 rounded-lg border border-white/5 max-w-xs mt-6">
      <button @click="archivedOnly = true" :class="[
        'px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wide',
        archivedOnly ? 'bg-primary text-background shadow-lg' : 'text-gray-400 hover:text-white'
      ]">Archivados</button>
      <button @click="archivedOnly = false" :class="[
        'px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wide',
        !archivedOnly ? 'bg-primary text-background shadow-lg' : 'text-gray-400 hover:text-white'
      ]">Todos</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useWorkouts } from '~/composables/useWorkouts'

const { workouts, list } = useWorkouts()
const { uid, ready } = useAuth()

const archivedOnly = ref(true)

onMounted(async () => {
  await ready
  if (uid.value) {
    list(uid.value, 100)
  }
})
</script>
