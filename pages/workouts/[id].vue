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
        </div>

        <div class="space-y-4">
          <div v-for="exercise in workout.exercises" :key="exercise.id" class="card">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">{{ exercise.name }}</h3>
              <span class="text-sm text-gray-500">{{ exercise.sets.length }} sets</span>
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
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="set in exercise.sets" :key="set.id">
                      <td class="px-3 py-2 text-sm text-gray-900">{{ set.setNumber }}</td>
                      <td class="px-3 py-2 text-sm text-gray-900">{{ set.reps }}</td>
                      <td class="px-3 py-2 text-sm text-gray-900">{{ set.weight }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
    console.error('Error fetching workout:', err)
    const status = err?.statusCode || err?.status
    const message = err?.statusMessage || err?.data?.statusMessage || 'Failed to load workout'
    error.value = status === 404 ? 'Workout not found' : message
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

onMounted(() => {
  fetchWorkout()
})
</script>
