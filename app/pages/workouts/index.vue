<template>
  <div class="page-workouts px-4 py-6 sm:px-0">
    <LayoutPageHeader title="Workouts">
      <template #actions>
        <NuxtLink to="/workouts/new">
          <UiButton variant="primary">New Workout</UiButton>
        </NuxtLink>
      </template>
    </LayoutPageHeader>
    <WorkoutsWorkoutList :workouts="workouts" :loading="loading" @delete="deleteWorkout" @copy="handleCopyRequested" />

    <div v-if="hasMore" class="mt-8 flex justify-center">
      <UiButton :loading="loadingMore" variant="secondary" @click="loadMore">
        Load More
      </UiButton>
    </div>

    <UiModal :open="isCopyModalOpen" @close="isCopyModalOpen = false">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Copy Workout</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Select the target date for the copied workout.
      </p>
      <UiInput v-model="targetDate" label="Target Date" type="date" />
      <template #footer>
        <div class="flex justify-end space-x-3">
          <UiButton variant="secondary" @click="isCopyModalOpen = false">Cancel</UiButton>
          <UiButton variant="primary" :loading="copying" @click="confirmCopy">Copy Workout</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
<script setup lang="ts">
const { workouts, list, remove, copy, hasMore, useWorkoutsFetch, loading: actionLoading } = useWorkouts()
const { uid } = useAuth()
const loadingMore = ref<boolean>(false)

const isCopyModalOpen = ref(false)
const selectedWorkout = ref<any>(null)
const targetDate = ref(new Date().toISOString().split('T')[0])
const copying = ref(false)

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

const handleCopyRequested = (workout: any) => {
  selectedWorkout.value = workout
  isCopyModalOpen.value = true
}

const confirmCopy = async () => {
  if (!uid.value || !selectedWorkout.value || !targetDate.value) return

  try {
    copying.value = true
    await copy(uid.value, selectedWorkout.value, targetDate.value)
    isCopyModalOpen.value = false
  } catch (error) {
    console.error('Error copying workout:', error)
    alert('Failed to copy workout')
  } finally {
    copying.value = false
  }
}
</script>
