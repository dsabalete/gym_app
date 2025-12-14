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
        <h2 class="text-xl font-semibold text-gray-900">
          {{ formatDate(workout.date) }}
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          {{ workout.exercises.length }} exercises • {{ totalSets }} sets
        </p>
        <div class="mt-4">
          <ExercisesExerciseEditor v-model="newExerciseName" @submit="onAddExercise" />
        </div>
      </UiCard>
      <ExercisesExerciseList :exercises="workout.exercises" @add-set="addSet" @save-set="saveSet"
        @remove-set="removeSet" @remove-exercise="removeExercise" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Workout } from '~/types/workout'
import type { Exercise, ExerciseSet } from '~/types/exercise'
import { formatDateUTC } from '~/utils/date'

const route = useRoute()

const loading = ref<boolean>(true)
const error = ref<string>('')
const workout = ref<Workout | null>(null)
const newExerciseName = ref<string>('')

const userId = 'user123'

const fetchWorkout = async () => {
  try {
    loading.value = true
    error.value = ''
    const response: any = await $fetch(`/api/workouts/${route.params.id}`, {
      query: { userId }
    })
    workout.value = response.workout
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

const formatDate = (dateString: string) => formatDateUTC(dateString)

const totalSets = computed(() => {
  if (!workout.value) return 0
  return workout.value.exercises.reduce((total: number, exercise: Exercise) => {
    return total + exercise.sets.length
  }, 0)
})

const addSet = async (exercise: Exercise) => {
  try {
    await $fetch(`/api/exercises/${exercise.id}/sets`, {
      method: 'POST',
      query: { userId },
      body: {}
    })
    await fetchWorkout()
  } catch (err) {
    console.error('Error adding set:', err)
    alert('Failed to add set')
  }
}

const saveSet = async (set: ExerciseSet) => {
  try {
    await $fetch(`/api/exercise-sets/${set.id}`, {
      method: 'PATCH',
      query: { userId },
      body: {
        setNumber: set.setNumber,
        reps: set.reps,
        weight: set.weight
      }
    })
    await fetchWorkout()
  } catch (err) {
    console.error('Error saving set:', err)
    alert('Failed to save set')
  }
}

const removeSet = async (set: ExerciseSet) => {
  if (!confirm('Delete this set?')) return
  try {
    await $fetch(`/api/exercise-sets/${set.id}`, {
      method: 'DELETE',
      query: { userId }
    })
    await fetchWorkout()
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
    await $fetch(`/api/workouts/${workout.value.id}/exercises`, {
      method: 'POST',
      query: { userId },
      body: { name }
    })
    await fetchWorkout()
  } catch (err) {
    console.error('Error adding exercise:', err)
    alert('Failed to add exercise')
  }
}

const removeExercise = async (exercise: Exercise) => {
  if (!confirm(`Remove exercise "${exercise.name}"? This will delete its sets.`)) return
  try {
    await $fetch(`/api/exercises/${exercise.id}`, {
      method: 'DELETE',
      query: { userId }
    })
    await fetchWorkout()
  } catch (err) {
    console.error('Error removing exercise:', err)
    alert('Failed to remove exercise')
  }
}
</script>
