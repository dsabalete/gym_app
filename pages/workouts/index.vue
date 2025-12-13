<template>
  <div>
    <div class="px-4 py-6 sm:px-0">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Workouts</h1>
        <NuxtLink to="/workouts/new" class="btn-primary">
          New Workout
        </NuxtLink>
      </div>

      <div class="space-y-4">
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-500">Loading workouts...</p>
        </div>

        <div v-else-if="workouts.length === 0" class="text-center py-8">
          <p class="text-gray-500">No workouts yet. Start by creating your first workout!</p>
          <NuxtLink to="/workouts/new" class="btn-primary mt-4 inline-block">
            Create First Workout
          </NuxtLink>
        </div>

        <div v-else v-for="workout in workouts" :key="workout.id" class="card">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-medium text-gray-900">
                {{ formatDate(workout.date) }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ workout.exercises.length }} exercises • {{ getTotalSets(workout) }} sets
              </p>
            </div>
            <div class="flex space-x-2">
              <button @click="deleteWorkout(workout.id)" class="text-red-600 hover:text-red-700">
                Delete
              </button>
            </div>
          </div>

          <div class="mt-4">
            <div class="flex flex-wrap gap-2">
              <span v-for="exercise in workout.exercises.slice(0, 6)" :key="exercise.id"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {{ exercise.name }}
              </span>
              <span v-if="workout.exercises.length > 6"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{{ workout.exercises.length - 6 }} more
              </span>
            </div>
            <div class="mt-4 flex justify-end">
              <NuxtLink :to="`/workouts/${workout.id}`" class="btn-secondary">
                View Details
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const loading = ref(true)
const workouts = ref([])

const userId = 'user123'

const fetchWorkouts = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/workouts', {
      query: { userId, limit: 100 }
    })
    workouts.value = response.workouts
  } catch (error) {
    console.error('Error fetching workouts:', error)
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

const getTotalSets = (workout) => {
  return workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.length
  }, 0)
}

const deleteWorkout = async (workoutId) => {
  if (!confirm('Are you sure you want to delete this workout?')) return
  try {
    await $fetch(`/api/workouts/${workoutId}`, {
      method: 'DELETE',
      query: { userId }
    })
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
