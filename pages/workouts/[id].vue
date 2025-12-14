<template>
  <div>
    <div class="px-4 py-6 sm:px-0">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Workout Detail</h1>
        <NuxtLink to="/workouts" class="btn-primary">
          Back to Workouts
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Loading workout...</p>
      </div>

      <div v-else-if="error" class="card">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <div v-else-if="!workout" class="card">
        <p class="text-gray-500">Workout not found.</p>
      </div>

      <div v-else class="space-y-6">
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ formatDate(workout.date) }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ workout.exercises.length }} exercises • {{ totalSets }} sets
          </p>
          <div class="mt-4 flex items-center gap-2">
            <input v-model="newExerciseName" type="text" placeholder="New exercise name"
              class="border rounded px-3 py-2 w-64" />
            <button @click="addExercise" class="btn-primary">Add Exercise</button>
          </div>
        </div>

        <div class="space-y-4">
          <div v-for="exercise in workout.exercises" :key="exercise.id" class="card">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">{{ exercise.name }}</h3>
              <span class="text-sm text-gray-500">{{ exercise.sets.length }} sets</span>
              <button @click="removeExercise(exercise)" class="text-red-600 hover:text-red-700">Remove Exercise</button>
            </div>
            <div class="mt-4">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Set
                      </th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reps
                      </th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight
                      </th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="set in exercise.sets" :key="set.id">
                      <td class="px-3 py-2 text-sm text-gray-900">
                        <input v-model.number="set.setNumber" type="number" min="1"
                          class="w-16 border rounded px-2 py-1" />
                      </td>
                      <td class="px-3 py-2 text-sm text-gray-900">
                        <input v-model.number="set.reps" type="number" min="1" class="w-20 border rounded px-2 py-1" />
                      </td>
                      <td class="px-3 py-2 text-sm text-gray-900">
                        <input v-model.number="set.weight" type="number" step="0.5" min="0"
                          class="w-24 border rounded px-2 py-1" />
                      </td>
                      <td class="px-3 py-2 text-sm text-gray-900">
                        <button @click="saveSet(set)" class="btn-secondary mr-2">Save</button>
                        <button @click="removeSet(set)" class="text-red-600 hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="mt-4">
              <button @click="addSet(exercise)" class="btn-primary">Add Set</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const loading = ref(true)
const error = ref('')
const workout = ref(null)
const newExerciseName = ref('')

const userId = 'user123'

const fetchWorkout = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await $fetch(`/api/workouts/${route.params.id}`, {
      query: { userId }
    })
    workout.value = response.workout
  } catch (err) {
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const totalSets = computed(() => {
  if (!workout.value) return 0
  return workout.value.exercises.reduce((total, exercise) => {
    return total + exercise.sets.length
  }, 0)
})

const addSet = async (exercise) => {
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

const saveSet = async (set) => {
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

const removeSet = async (set) => {
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

const addExercise = async () => {
  const name = newExerciseName.value.trim()
  if (!name) {
    alert('Please enter an exercise name')
    return
  }
  try {
    await $fetch(`/api/workouts/${workout.value.id}/exercises`, {
      method: 'POST',
      query: { userId },
      body: { name }
    })
    newExerciseName.value = ''
    await fetchWorkout()
  } catch (err) {
    console.error('Error adding exercise:', err)
    alert('Failed to add exercise')
  }
}

const removeExercise = async (exercise) => {
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
