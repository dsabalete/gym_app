<template>
  <div class="page-workouts px-4 py-6 sm:px-0">
    <LayoutPageHeader title="Workouts">
      <template #actions>
        <NuxtLink to="/workouts/new">
          <UiButton variant="primary">New Workout</UiButton>
        </NuxtLink>
      </template>
    </LayoutPageHeader>
    <WorkoutsWorkoutList :workouts="workouts" :loading="loading" @delete="deleteWorkout" />
  </div>
</template>
<script setup lang="ts">
import type { Workout } from '~/types/workout'

const loading = ref<boolean>(true)
const workouts = ref<Workout[]>([])

const userId = 'user123'

const fetchWorkouts = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/workouts', {
      query: { userId, limit: 100 }
    })
    workouts.value = response.workouts
  } catch (error) {
    console.error('Error fetching workouts:', error)
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
    await fetchWorkouts()
  } catch (error) {
    console.error('Error deleting workout:', error)
    alert('Failed to delete workout')
  }
}

onMounted(() => {
  fetchWorkouts()
})
</script>
