<template>
  <div>
    <div class="px-4 py-6 sm:px-0">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Quick Stats -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Total Workouts</h3>
          <p class="text-3xl font-bold text-primary-600">{{ stats.totalWorkouts }}</p>
        </div>
        
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-2">This Week</h3>
          <p class="text-3xl font-bold text-primary-600">{{ stats.thisWeekWorkouts }}</p>
        </div>
        
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Total Exercises</h3>
          <p class="text-3xl font-bold text-primary-600">{{ stats.totalExercises }}</p>
        </div>
      </div>

      <!-- Recent Workouts -->
      <div class="mt-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Recent Workouts</h2>
          <NuxtLink to="/workouts/new" class="btn-primary">
            New Workout
          </NuxtLink>
        </div>
        
        <div class="space-y-4">
          <div v-if="loading" class="text-center py-8">
            <p class="text-gray-500">Loading workouts...</p>
          </div>
          
          <div v-else-if="recentWorkouts.length === 0" class="text-center py-8">
            <p class="text-gray-500">No workouts yet. Start by creating your first workout!</p>
            <NuxtLink to="/workouts/new" class="btn-primary mt-4 inline-block">
              Create First Workout
            </NuxtLink>
          </div>
          
          <div v-else v-for="workout in recentWorkouts" :key="workout.id" class="card">
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
                <NuxtLink :to="`/workouts/${workout.id}`" class="text-primary-600 hover:text-primary-700">
                  View
                </NuxtLink>
                <button @click="deleteWorkout(workout.id)" class="text-red-600 hover:text-red-700">
                  Delete
                </button>
              </div>
            </div>
            
            <div class="mt-4">
              <div class="flex flex-wrap gap-2">
                <span v-for="exercise in workout.exercises.slice(0, 3)" :key="exercise.id" 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {{ exercise.name }}
                </span>
                <span v-if="workout.exercises.length > 3" 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{{ workout.exercises.length - 3 }} more
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $api } = useNuxtApp()
const loading = ref(true)
const stats = ref({
  totalWorkouts: 0,
  thisWeekWorkouts: 0,
  totalExercises: 0
})
const recentWorkouts = ref([])

// Mock user ID - in real app, this would come from auth
const userId = 'user123'

const fetchDashboardData = async () => {
  try {
    loading.value = true
    
    // Fetch recent workouts
    const response = await $fetch('/api/workouts', {
      query: { userId, limit: 10 }
    })
    
    recentWorkouts.value = response.workouts
    
    // Calculate stats
    stats.value.totalWorkouts = response.workouts.length
    stats.value.thisWeekWorkouts = response.workouts.filter(w => {
      const workoutDate = new Date(w.date)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return workoutDate >= weekAgo
    }).length
    
    stats.value.totalExercises = response.workouts.reduce((total, workout) => {
      return total + workout.exercises.length
    }, 0)
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
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
    
    // Refresh data
    await fetchDashboardData()
  } catch (error) {
    console.error('Error deleting workout:', error)
    alert('Failed to delete workout')
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>