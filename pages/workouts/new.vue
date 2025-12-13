<template>
  <div>
    <div class="px-4 py-6 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">New Workout</h1>
        <NuxtLink to="/" class="btn-secondary">
          Back to Dashboard
        </NuxtLink>
      </div>

      <form @submit.prevent="saveWorkout" class="space-y-6">
        <!-- Workout Date -->
        <div class="card">
          <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
            Workout Date
          </label>
          <input id="date" v-model="workout.date" type="date" required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
        </div>

        <!-- Exercises -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-900">Exercises</h2>
            <button type="button" @click="addExercise" class="btn-primary">
              Add Exercise
            </button>
          </div>

          <div v-if="workout.exercises.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
            <p class="text-gray-500">No exercises added yet.</p>
            <button type="button" @click="addExercise" class="btn-primary mt-4">
              Add First Exercise
            </button>
          </div>

          <div v-for="(exercise, exerciseIndex) in workout.exercises" :key="exercise.id" class="card">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-md font-medium text-gray-900">Exercise {{ exerciseIndex + 1 }}</h3>
              <button type="button" @click="removeExercise(exerciseIndex)" class="text-red-600 hover:text-red-700">
                Remove
              </button>
            </div>

            <div class="mb-4">
              <label :for="`exercise-name-${exerciseIndex}`" class="block text-sm font-medium text-gray-700 mb-2">
                Exercise Name
              </label>
              <input :id="`exercise-name-${exerciseIndex}`" v-model="exercise.name" type="text"
                placeholder="e.g., Bench Press, Squats, Deadlifts" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
            </div>

            <!-- Sets -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <h4 class="text-sm font-medium text-gray-700">Sets</h4>
                <button type="button" @click="addSet(exerciseIndex)" class="text-sm btn-secondary">
                  Add Set
                </button>
              </div>

              <div v-if="exercise.sets.length === 0" class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded">
                No sets added yet.
              </div>

              <div v-for="(set, setIndex) in exercise.sets" :key="set.id" class="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label :for="`set-number-${exerciseIndex}-${setIndex}`" class="block text-xs text-gray-600 mb-1">
                    Set #
                  </label>
                  <input :id="`set-number-${exerciseIndex}-${setIndex}`" v-model.number="set.setNumber" type="number"
                    min="1" required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>

                <div>
                  <label :for="`reps-${exerciseIndex}-${setIndex}`" class="block text-xs text-gray-600 mb-1">
                    Reps
                  </label>
                  <input :id="`reps-${exerciseIndex}-${setIndex}`" v-model.number="set.reps" type="number" min="1"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>

                <div>
                  <label :for="`weight-${exerciseIndex}-${setIndex}`" class="block text-xs text-gray-600 mb-1">
                    Weight (lbs)
                  </label>
                  <div class="flex">
                    <input :id="`weight-${exerciseIndex}-${setIndex}`" v-model.number="set.weight" type="number" min="0"
                      step="0.5" required
                      class="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    <button type="button" @click="removeSet(exerciseIndex, setIndex)"
                      class="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md text-red-600 hover:bg-red-50">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end space-x-4">
          <NuxtLink to="/" class="btn-secondary">
            Cancel
          </NuxtLink>
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Saving...' : 'Save Workout' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const loading = ref(false)
const workout = ref({
  date: new Date().toISOString().split('T')[0], // Today's date
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

const removeExercise = (index) => {
  workout.value.exercises.splice(index, 1)
}

const addSet = (exerciseIndex) => {
  const exercise = workout.value.exercises[exerciseIndex]
  const nextSetNumber = exercise.sets.length + 1
  exercise.sets.push({
    id: Date.now(),
    setNumber: nextSetNumber,
    reps: 0,
    weight: 0
  })
}

const removeSet = (exerciseIndex, setIndex) => {
  workout.value.exercises[exerciseIndex].sets.splice(setIndex, 1)

  // Renumber remaining sets
  workout.value.exercises[exerciseIndex].sets.forEach((set, index) => {
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

    const response = await $fetch('/api/workouts', {
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
  addExercise()
})
</script>
