<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useWorkouts } from '~/composables/useWorkouts'
import type { Workout } from '~~/types/workout'
import { isDateInCurrentUTCWeek } from '~~/app/utils/date'

const { workouts, list, remove } = useWorkouts()
const loading = ref<boolean>(true)
const stats = ref<{ totalWorkouts: number; thisWeekWorkouts: number; totalExercises: number }>({
  totalWorkouts: 0,
  thisWeekWorkouts: 0,
  totalExercises: 0
})

const { uid, ready } = useAuth()

const fetchDashboardData = async () => {
  try {
    loading.value = true
    await ready
    if (!uid.value) {
      throw new Error('No authenticated user')
    }
    await list(uid.value, 10)
    stats.value.totalWorkouts = workouts.value.length
    stats.value.thisWeekWorkouts = workouts.value.filter((w: Workout) => {
      return isDateInCurrentUTCWeek(w.date, 1)
    }).length
    stats.value.totalExercises = workouts.value.reduce((total: number, workout: Workout) => total + workout.exercises.length, 0)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const deleteWorkout = async (workoutId: string) => {
  if (!confirm('Are you sure you want to delete this workout?')) return

  try {
    await ready
    if (!uid.value) return
    await remove(workoutId, uid.value)

    // Refresh data
    await fetchDashboardData()
  } catch (error) {
    console.error('Error deleting workout:', error)
    alert('Failed to delete workout')
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="grid grid-cols-3 gap-4">
      <UiCard>
        <h3 class="card-title">Total Workouts</h3>
        <p class="card-content">{{ stats.totalWorkouts }}</p>
      </UiCard>
      <UiCard>
        <h3 class="card-title">This Week</h3>
        <p class="card-content">{{ stats.thisWeekWorkouts }}</p>
      </UiCard>
      <UiCard>
        <h3 class="card-title">Total Exercises</h3>
        <p class="card-content">{{ stats.totalExercises }}</p>
      </UiCard>
    </div>
    <div class="mt-8">
      <LayoutPageHeader title="Recent Workouts">
        <template #actions>
          <NuxtLink to="/workouts/new">
            <UiButton variant="primary">New Workout</UiButton>
          </NuxtLink>
        </template>
      </LayoutPageHeader>
      <WorkoutsWorkoutList :workouts="workouts" :loading="loading" @delete="deleteWorkout" />
    </div>
  </div>
</template>

<style lang="css" scoped>
.card-title {
  @apply text-xs font-bold uppercase tracking-wider text-gray-400 mb-1;
}

.card-content {
  @apply text-3xl font-bold text-white;
}
</style>
