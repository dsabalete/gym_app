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

    <div v-if="hasMore" class="mt-8 flex justify-center">
      <UiButton :loading="loadingMore" variant="secondary" @click="loadMore">
        Load More
      </UiButton>
    </div>
  </div>
</template>
<script setup lang="ts">
const { workouts, list, remove, hasMore, useWorkoutsFetch, loading: actionLoading } = useWorkouts()
const { uid } = useAuth()
const loadingMore = ref<boolean>(false)

// Use the new lazy-loading fetch mechanism
const { status, error: fetchError } = useWorkoutsFetch(uid)

// Combined loading state for UI
const loading = computed(() => status.value === 'pending' || actionLoading.value)

const loadMore = async () => {
  try {
    loadingMore.value = true
    if (!uid.value) return
    await list(uid.value, 10, true)
  } catch (error) {
    console.error('Error loading more workouts:', error)
  } finally {
    loadingMore.value = false
  }
}

const deleteWorkout = async (workoutId: string) => {
  if (!confirm('Are you sure you want to delete this workout?')) return
  try {
    if (!uid.value) return
    await remove(workoutId, uid.value)
  } catch (error) {
    console.error('Error deleting workout:', error)
    alert('Failed to delete workout')
  }
}
</script>
