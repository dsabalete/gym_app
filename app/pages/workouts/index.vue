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
import type { Workout } from '~~/types/workout'

const { workouts, list, remove } = useWorkouts()
const { uid, ready } = useAuth()
const loading = ref<boolean>(true)

const fetchWorkouts = async () => {
  try {
    loading.value = true
    await ready
    if (!uid.value) {
      throw new Error('No authenticated user')
    }
    await list(uid.value, 100)
  } catch (error) {
    console.error('Error fetching workouts:', error)
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
