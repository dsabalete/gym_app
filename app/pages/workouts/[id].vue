<template>
  <div class="px-4 py-6 sm:px-0">
    <LayoutPageHeader title="Workout Detail">
      <template #actions>
        <NuxtLink to="/workouts">
          <UiButton variant="primary">Back to Workouts</UiButton>
        </NuxtLink>
      </template>
    </LayoutPageHeader>
    <div v-if="loading" class="text-center py-8">
      <UiSkeleton class="mx-auto" width="240px" height="20px" />
      <p class="text-gray-500 mt-2">Loading workout...</p>
    </div>
    <UiAlert v-else-if="error" type="error" :message="error" />
    <UiCard v-else-if="!workout">
      <p class="text-gray-500">Workout not found.</p>
    </UiCard>
    <div v-else class="space-y-6">
      <UiCard>
        <div class="flex items-center gap-3">
          <UiInput v-model="editableDate" type="date" class="w-44" />
          <UiButton variant="primary" @click="updateDate">Save</UiButton>
          <UiButton v-if="isDev" variant="secondary" @click="runStressTest">Stress Test</UiButton>
        </div>
        <p class="text-sm text-gray-500 mt-1">
          {{ workout.exercises.length }} exercises • {{ totalSets }} sets
        </p>
        <div class="mt-4">
          <ExercisesExerciseEditor v-model="newExerciseName" @submit="onAddExercise" />
        </div>
      </UiCard>
      <ExercisesExerciseList :exercises="workout.exercises" :saving-ids="savingSetIds" @add-set="addSet"
        @save-set="saveSet" @remove-set="removeSet" @remove-exercise="removeExercise"
        @reorder-exercise="onReorderExercise" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Exercise, ExerciseSet } from '~~/types/exercise'
import { useWorkouts } from '~/composables/useWorkouts'
import { useWorkoutEditor } from '~/composables/useWorkoutEditor'
import { useAuth } from '~/composables/useAuth'
import { nextTick } from 'vue'
import { useDebounce } from '~/utils/debounce'

const route = useRoute()

const loading = ref<boolean>(true)
const error = ref<string>('')
const newExerciseName = ref<string>('')
const editableDate = ref<string>('')
const savingSetIds = ref<Set<string>>(new Set())
const debouncedSaves = new Map<string, ReturnType<typeof useDebounce>>()

const { uid, ready } = useAuth()
const { getById, workout, updateDate: updateWorkoutDate } = useWorkouts()
const editor = useWorkoutEditor()
const isDev = import.meta.dev

const fetchWorkout = async () => {
  try {
    loading.value = true
    error.value = ''
    await ready
    if (!uid.value) throw new Error('No authenticated user')
    await getById(String(route.params.id), uid.value)
    editableDate.value = workout.value?.date || ''
  } catch (err: any) {
    const status = err?.statusCode || err?.status
    const message = err?.statusMessage || err?.data?.statusMessage || 'Failed to load workout'
    error.value = status === 404 ? 'Workout not found' : message
    if (status !== 404) {
      console.error('Error fetching workout:', err)
    }
    workout.value = null
  } finally {
    loading.value = false
  }
}

// const formatDate = (dateString: string) => formatDateUTC(dateString)

const totalSets = computed(() => {
  if (!workout.value) return 0
  return workout.value.exercises.reduce((total: number, exercise: Exercise) => {
    return total + exercise.sets.length
  }, 0)
})

const updateDate = async () => {
  if (!workout.value || !editableDate.value) return
  try {
    await ready
    if (!uid.value) return
    await updateWorkoutDate(uid.value, workout.value.id, editableDate.value)
  } catch (err) {
    console.error('Error updating date:', err)
    alert('Failed to update date')
  }
}

const addSet = async (exercise: Exercise) => {
  try {
    if (!workout.value) return
    await ready
    if (!uid.value) return
    await editor.addSet(uid.value, workout.value.id, exercise.id)
  } catch (err) {
    console.error('Error adding set:', err)
    alert('Failed to add set')
  }
}

const saveSet = async (payload: { set: ExerciseSet; exerciseId: string }) => {
  try {
    const { set, exerciseId } = payload
    if (!workout.value) return
    await ready
    if (!uid.value) return
    const key = set.id
    if (!debouncedSaves.has(key)) {
      debouncedSaves.set(
        key,
        useDebounce(async (latest: ExerciseSet) => {
          savingSetIds.value.add(key)
          console.time(`saveSet:${key}`)
          try {
            await editor.saveSet(uid.value!, workout.value!.id, exerciseId, latest)
          } finally {
            console.timeEnd(`saveSet:${key}`)
            // yield to UI to render updated state before removing indicator
            await nextTick()
            savingSetIds.value.delete(key)
          }
        }, 300)
      )
    }
    debouncedSaves.get(key)!(set)
  } catch (err) {
    console.error('Error saving set:', err)
    alert('Failed to save set')
  }
}

const removeSet = async (payload: { set: ExerciseSet; exerciseId: string }) => {
  if (!confirm('Delete this set?')) return
  try {
    if (!workout.value) return
    await ready
    if (!uid.value) return
    await editor.removeSet(uid.value, workout.value.id, payload.exerciseId, payload.set.id)
  } catch (err) {
    console.error('Error deleting set:', err)
    alert('Failed to delete set')
  }
}

onMounted(() => {
  fetchWorkout()
})

const onAddExercise = async (name: string) => {
  if (!name) {
    alert('Please enter an exercise name')
    return
  }
  try {
    if (!workout.value) return
    await ready
    if (!uid.value) return
    await editor.addExercise(uid.value, workout.value.id, name)
  } catch (err) {
    console.error('Error adding exercise:', err)
    alert('Failed to add exercise')
  }
}

const removeExercise = async (exercise: Exercise) => {
  if (!confirm(`Remove exercise "${exercise.name}"? This will delete its sets.`)) return
  try {
    if (!workout.value) return
    await ready
    if (!uid.value) return
    await editor.removeExercise(uid.value, workout.value.id, exercise.id)
  } catch (err) {
    console.error('Error removing exercise:', err)
    alert('Failed to remove exercise')
  }
}

const onReorderExercise = async (payload: { exercise: Exercise; index: number; direction: 'up' | 'down' }) => {
  if (!workout.value) return
  const { index, direction } = payload
  const newExercises = [...workout.value.exercises]
  const targetIndex = direction === 'up' ? index - 1 : index + 1

  if (targetIndex < 0 || targetIndex >= newExercises.length) return

  // Swap
  const temp = newExercises[index]!
  newExercises[index] = newExercises[targetIndex]!
  newExercises[targetIndex] = temp

  try {
    await ready
    if (!uid.value) return
    await editor.updateExerciseOrder(uid.value, workout.value.id, newExercises)
  } catch (err) {
    console.error('Error reordering exercise:', err)
    alert('Failed to reorder exercise')
  }
}

const runStressTest = async () => {
  if (!workout.value) return
  const ex = workout.value.exercises[0]
  if (!ex) return
  for (const set of ex.sets) {
    for (let i = 0; i < 20; i++) {
      const payload = {
        set: { ...set, reps: Math.floor(Math.random() * 12) + 1, weight: Math.round(Math.random() * 1000) / 10 },
        exerciseId: ex.id
      }
      // Use the same debounced path as UI
      await saveSet(payload)
    }
  }
}

</script>
