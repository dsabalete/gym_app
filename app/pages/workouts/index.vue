<template>
  <div class="page-workouts px-4 py-6 sm:px-0">
    <LayoutPageHeader title="Workouts">
      <template #actions>
        <NuxtLink to="/workouts/new">
          <UiButton variant="primary">New Workout</UiButton>
        </NuxtLink>
      </template>
    </LayoutPageHeader>
    <WorkoutsWorkoutList
      :workouts="workouts"
      :loading="loading"
      @delete="requestDelete"
      @copy="handleCopyRequested"
      @archive="requestArchive"
    />

    <UiAlert v-if="successMessage" type="success" :title="successMessage" dismissible @close="successMessage = ''" />

    <div class="mt-4">
      <NuxtLink to="/workouts/archived">
        <UiButton variant="secondary">View Completed</UiButton>
      </NuxtLink>
    </div>

    <div v-if="hasMore" class="mt-8 flex justify-center">
      <UiButton :loading="loadingMore" variant="secondary" @click="loadMore">
        Load More
      </UiButton>
    </div>

    <UiModal :open="isCopyModalOpen" @close="isCopyModalOpen = false">
      <h3 class="text-lg font-bold text-white uppercase tracking-wide mb-4">Copy Workout</h3>
      <p class="text-sm text-gray-400 mb-6">
        Select the target date for the copied workout.
      </p>
      <UiInput v-model="targetDate" label="Target Date" type="date" />
      <div class="mt-4 flex items-center space-x-2">
        <input id="increaseReps" type="checkbox" :checked="increaseRepsOne" @change="increaseRepsOne = ($event.target as HTMLInputElement).checked"
          class="h-4 w-4 rounded border border-white/20 bg-white/5 text-primary focus:ring-primary" />
        <label for="increaseReps" class="text-sm text-gray-300">Increase reps by +1 per set</label>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <UiButton variant="ghost" @click="isCopyModalOpen = false">Cancel</UiButton>
          <UiButton variant="primary" :loading="copying" @click="confirmCopy">Copy Workout</UiButton>
        </div>
      </template>
    </UiModal>

    <UiModal :open="confirmOpen" @close="confirmOpen = false">
      <h3 class="text-lg font-bold text-white uppercase tracking-wide mb-4">{{ confirmTitle }}</h3>
      <p class="text-sm text-gray-400 mb-6">{{ confirmMessage }}</p>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <UiButton variant="ghost" :disabled="confirming" @click="confirmOpen = false">Cancel</UiButton>
          <UiButton variant="primary" :loading="confirming" @click="runConfirm">{{ confirmLabel }}</UiButton>
        </div>
      </template>
    </UiModal>

    <UiModal :open="alertOpen" @close="alertOpen = false">
      <h3 class="text-lg font-bold text-white uppercase tracking-wide mb-4">{{ alertTitle }}</h3>
      <p class="text-sm text-gray-400 mb-6">{{ alertMessage }}</p>
      <template #footer>
        <div class="flex justify-end">
          <UiButton variant="primary" @click="alertOpen = false">OK</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useWorkouts } from '~/composables/useWorkouts'

const { workouts, list, remove, copy, archive, hasMore, useWorkoutsFetch, loading: actionLoading } = useWorkouts()
const { uid } = useAuth()
const loadingMore = ref<boolean>(false)
const successMessage = ref<string>('')

const isCopyModalOpen = ref(false)
const selectedWorkout = ref<any>(null)
const targetDate = ref(new Date().toISOString().split('T')[0])
const copying = ref(false)
const increaseRepsOne = ref(false)

const alertOpen = ref(false)
const alertTitle = ref('')
const alertMessage = ref('')
const confirmOpen = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmLabel = ref('Confirm')
const confirming = ref(false)
const confirmAction = ref<null | (() => Promise<void> | void)>(null)

// Use the new lazy-loading fetch mechanism
const { status, error: fetchError } = useWorkoutsFetch(uid)

// Combined loading state for UI
const loading = computed(() => status.value === 'pending' || actionLoading.value)

const openAlert = (message: string, title = 'Something went wrong') => {
  alertTitle.value = title
  alertMessage.value = message
  alertOpen.value = true
}

const openConfirm = (options: { title: string; message: string; confirmLabel?: string; onConfirm: () => Promise<void> | void }) => {
  confirmTitle.value = options.title
  confirmMessage.value = options.message
  confirmLabel.value = options.confirmLabel || 'Confirm'
  confirmAction.value = options.onConfirm
  confirmOpen.value = true
}

const runConfirm = async () => {
  const action = confirmAction.value
  if (!action || confirming.value) return
  try {
    confirming.value = true
    await action()
    confirmOpen.value = false
  } finally {
    confirming.value = false
  }
}

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

const requestDelete = (workoutId: string) => {
  openConfirm({
    title: 'Delete workout',
    message: 'Are you sure you want to delete this workout?',
    confirmLabel: 'Delete',
    onConfirm: async () => {
      try {
        if (!uid.value) return
        await remove(workoutId, uid.value)
      } catch (error) {
        console.error('Error deleting workout:', error)
        openAlert('Failed to delete workout')
      }
    }
  })
}

const requestArchive = (workoutId: string) => {
  openConfirm({
    title: 'Complete workout',
    message: 'Archive this workout? You can restore it later.',
    confirmLabel: 'Complete',
    onConfirm: async () => {
      try {
        if (!uid.value) return
        await archive(uid.value, workoutId)
        successMessage.value = 'Workout marked as completed'
      } catch (error) {
        console.error('Error archiving workout:', error)
        openAlert('Failed to archive workout')
      }
    }
  })
}

const handleCopyRequested = (workout: any) => {
  selectedWorkout.value = workout
  isCopyModalOpen.value = true
}

const confirmCopy = async () => {
  if (!uid.value || !selectedWorkout.value || !targetDate.value) return

  try {
    copying.value = true
    await copy(uid.value, selectedWorkout.value, targetDate.value, { incrementRepsByOne: increaseRepsOne.value })
    isCopyModalOpen.value = false
    increaseRepsOne.value = false
    const refreshLimit = Math.max(workouts.value.length, 10)
    await list(uid.value, refreshLimit)
  } catch (error) {
    console.error('Error copying workout:', error)
    openAlert('Failed to copy workout')
  } finally {
    copying.value = false
  }
}
</script>

<style scoped></style>
