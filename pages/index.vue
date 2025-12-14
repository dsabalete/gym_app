<script setup lang="ts">
import type { Workout } from '~/types/workout'

const loading = ref<boolean>(true)
const stats = ref<{ totalWorkouts: number; thisWeekWorkouts: number; totalExercises: number }>({
  totalWorkouts: 0,
  thisWeekWorkouts: 0,
  totalExercises: 0
})
const recentWorkouts = ref<Workout[]>([])

// Mock user ID - in real app, this would come from auth
const userId = 'user123'

const fetchDashboardData = async () => {
  try {
    loading.value = true

    // Fetch recent workouts
    const response: any = await $fetch('/api/workouts', {
      query: { userId, limit: 10 }
    })

    recentWorkouts.value = response.workouts as Workout[]
    stats.value.totalWorkouts = recentWorkouts.value.length
    stats.value.thisWeekWorkouts = recentWorkouts.value.filter((w: Workout) => {
      const workoutDate = new Date(w.date)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return workoutDate >= weekAgo
    }).length
    stats.value.totalExercises = recentWorkouts.value.reduce((total: number, workout: Workout) => total + workout.exercises.length, 0)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const deleteWorkout = async (workoutId: string) => {
  if (!confirm('Are you sure you want to delete this workout?')) return

  try {
    await $fetch(`/api/workouts/${workoutId}`, {
      method: 'DELETE',
      query: { userId }
    })

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
      <WorkoutsWorkoutList :workouts="recentWorkouts" :loading="loading" @delete="deleteWorkout" />
    </div>
  </div>
</template>

<style lang="css" scoped>
.card-title {
  @apply text-xs font-medium text-gray-600 dark:text-gray-300 mb-1;
}

.card-content {
  @apply text-2xl font-bold text-gray-900 dark:text-gray-300;
}
</style>