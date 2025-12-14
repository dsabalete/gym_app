<template>
  <div class="px-4 py-6 sm:px-0">
    <LayoutPageHeader title="New Workout">
      <template #actions>
        <NuxtLink to="/">
          <UiButton variant="secondary">Back to Dashboard</UiButton>
        </NuxtLink>
      </template>
    </LayoutPageHeader>

    <form @submit.prevent="saveWorkout" class="space-y-6">
      <UiCard>
        <UiInput v-model="workout.date" type="date" label="Workout Date" />
      </UiCard>

      <!-- Exercises -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-900 dark:text-gray-200">Exercises</h2>
          <UiButton type="button" variant="primary" @click="addExercise">Add Exercise</UiButton>
        </div>

        <div v-if="workout.exercises.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
          <p class="text-gray-500">No exercises added yet.</p>
          <UiButton type="button" variant="primary" class="mt-4" @click="addExercise">Add First Exercise</UiButton>
        </div>

        <div v-for="(exercise, exerciseIndex) in workout.exercises" :key="exercise.id" class="card">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-md font-medium text-gray-900 dark:text-gray-200">Exercise {{ exerciseIndex + 1 }}</h3>
            <button type="button" @click="removeExercise(exerciseIndex)" class="text-red-600 hover:text-red-700">
              Remove
            </button>
          </div>

          <div class="mb-4">
            <UiInput :id="`exercise-name-${exerciseIndex}`" v-model="exercise.name" type="text" label="Exercise Name"
              placeholder="e.g., Bench Press, Squats, Deadlifts" />
          </div>

          <!-- Sets -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h4 class="text-sm font-medium text-gray-700">Sets</h4>
              <UiButton type="button" variant="secondary" class="text-sm" @click="addSet(exerciseIndex)">Add Set
              </UiButton>
            </div>

            <div v-if="exercise.sets.length === 0" class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded">
              No sets added yet.
            </div>

            <div v-for="(set, setIndex) in exercise.sets" :key="set.id" class="grid grid-cols-3 gap-3 items-end">
              <div>
                <label :for="`set-number-${exerciseIndex}-${setIndex}`" class="block text-xs text-gray-600 mb-1">
                  Set #
                </label>
                <UiInput :id="`set-number-${exerciseIndex}-${setIndex}`" v-model.number="set.setNumber" type="number"
                  label="Set #" />
              </div>

              <div>
                <UiInput :id="`reps-${exerciseIndex}-${setIndex}`" v-model.number="set.reps" type="number"
                  label="Reps" />
              </div>

              <div>
                <UiInput :id="`weight-${exerciseIndex}-${setIndex}`" v-model.number="set.weight" type="number"
                  label="Weight (lbs)" />
                <UiButton type="button" variant="secondary" class="ml-2" @click="removeSet(exerciseIndex, setIndex)">
                  Remove
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-4">
        <NuxtLink to="/">
          <UiButton variant="secondary">Cancel</UiButton>
        </NuxtLink>
        <UiButton type="submit" :loading="loading" variant="primary">Save Workout</UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const loading = ref<boolean>(false)
const workout = ref<{ date: string; exercises: Array<{ id: number; name: string; sets: Array<{ id: number; setNumber: number; reps: number; weight: number }> }> }>({
  date: '',
  exercises: []
})

// Mock user ID - in real app, this would come from auth
const userId = 'user123'

const addExercise = () => {
  workout.value.exercises.push({
    id: Date.now(),
    name: '',
    sets: []
  })
}

const removeExercise = (index: number) => {
  workout.value.exercises.splice(index, 1)
}

const addSet = (exerciseIndex: number) => {
  const exercise = workout.value.exercises[exerciseIndex]!
  const nextSetNumber = exercise.sets.length + 1
  exercise.sets.push({
    id: Date.now(),
    setNumber: nextSetNumber,
    reps: 0,
    weight: 0
  })
}

const removeSet = (exerciseIndex: number, setIndex: number) => {
  const ex = workout.value.exercises[exerciseIndex]!
  ex.sets.splice(setIndex, 1)

  // Renumber remaining sets
  ex.sets.forEach((set, index) => {
    set.setNumber = index + 1
  })
}

const saveWorkout = async () => {
  // Validate form
  if (!workout.value.date) {
    alert('Please select a workout date')
    return
  }

  if (workout.value.exercises.length === 0) {
    alert('Please add at least one exercise')
    return
  }

  for (const exercise of workout.value.exercises) {
    if (!exercise.name.trim()) {
      alert('Please enter a name for all exercises')
      return
    }
    if (exercise.sets.length === 0) {
      alert('Please add at least one set for each exercise')
      return
    }
    for (const set of exercise.sets) {
      if (!set.reps || !set.weight) {
        alert('Please enter reps and weight for all sets')
        return
      }
    }
  }

  try {
    loading.value = true

    const response: any = await $fetch('/api/workouts', {
      method: 'POST',
      body: {
        userId,
        date: workout.value.date,
        exercises: workout.value.exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets.map(set => ({
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight
          }))
        }))
      }
    })

    if (response.success) {
      await navigateTo(`/workouts/${response.workoutId}`)
    }
  } catch (error) {
    console.error('Error saving workout:', error)
    alert('Failed to save workout. Please try again.')
  } finally {
    loading.value = false
  }
}

// Add first exercise by default
onMounted(() => {
  // Initialize date on client to avoid SSR/client timezone mismatches
  workout.value.date = new Date().toISOString().slice(0, 10)
  addExercise()
})
</script>
