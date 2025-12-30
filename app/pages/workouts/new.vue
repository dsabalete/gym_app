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
          <h2 class="text-lg font-bold text-white uppercase tracking-wide">Exercises</h2>
          <UiButton type="button" variant="primary" @click="addExercise">Add Exercise</UiButton>
        </div>

        <div v-if="workout.exercises.length === 0" class="text-center py-8 bg-white/5 rounded-lg border border-white/5">
          <p class="text-gray-400">No exercises added yet.</p>
          <UiButton type="button" variant="primary" class="mt-4" @click="addExercise">Add First Exercise</UiButton>
        </div>

        <UiCard v-for="(exercise, exerciseIndex) in workout.exercises" :key="exercise.id">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-md font-bold text-white uppercase tracking-wide">Exercise {{ exerciseIndex + 1 }}</h3>
            <button type="button" @click="removeExercise(exerciseIndex)" class="text-red-400 hover:text-red-300 font-medium">
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
              <h4 class="text-sm font-bold text-gray-400 uppercase">Sets</h4>
              <UiButton type="button" variant="ghost" class="text-sm" @click="addSet(exerciseIndex)">Add Set
              </UiButton>
            </div>

            <div v-if="exercise.sets.length === 0" class="text-sm text-gray-400 text-center py-4 bg-white/5 rounded border border-white/5">
              No sets added yet.
            </div>

            <div v-for="(set, setIndex) in exercise.sets" :key="set.id" class="grid grid-cols-4 gap-3 items-end">
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1 uppercase">
                  Set #
                </label>
                <div class="px-3 py-2 border border-white/10 bg-white/5 rounded text-sm text-white font-bold">{{ set.setNumber }}</div>
              </div>

              <div>
                <UiInput :id="`reps-${exerciseIndex}-${setIndex}`" v-model.number="set.reps" type="number"
                  label="Reps" />
              </div>

              <div>
                <UiInput :id="`weight-${exerciseIndex}-${setIndex}`" v-model.number="set.weight" type="number"
                  label="Weight" />
              </div>

              <div>
                <UiButton type="button" variant="danger" class="ml-2 w-full" @click="removeSet(exerciseIndex, setIndex)">
                  Remove
                </UiButton>
              </div>
            </div>
          </div>
        </UiCard>
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
import { useWorkouts } from '~/composables/useWorkouts'
import { useAuth } from '~/composables/useAuth'

const loading = ref<boolean>(false)
const workout = ref<{ date: string; exercises: Array<{ id: number; name: string; sets: Array<{ id: number; setNumber: number; reps: number; weight: number }> }> }>({
  date: '',
  exercises: []
})

const { uid, ready } = useAuth()

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
    const { create } = useWorkouts()
    await ready
    if (!uid.value) throw new Error('No authenticated user')
    const newId = await create(uid.value, {
      date: workout.value.date,
      exercises: workout.value.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets.map(set => ({
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight
        }))
      }))
    })
    await navigateTo(`/workouts/${newId}`)
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
