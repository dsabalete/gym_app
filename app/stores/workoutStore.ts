import { defineStore } from 'pinia'
import type { Workout } from '~~/types/workout'

export const useWorkoutStore = defineStore('workouts', () => {
    const workouts = ref<Workout[]>([])
    const currentWorkout = ref<Workout | null>(null)
    const lastFetched = ref<number | null>(null)

    function setWorkouts(newWorkouts: Workout[]) {
        workouts.value = newWorkouts
        lastFetched.value = Date.now()
    }

    function addWorkout(workout: Workout) {
        workouts.value = [workout, ...workouts.value]
    }

    function updateWorkout(updatedWorkout: Workout) {
        const index = workouts.value.findIndex(w => w.id === updatedWorkout.id)
        if (index !== -1) {
            workouts.value[index] = updatedWorkout
        }
        if (currentWorkout.value?.id === updatedWorkout.id) {
            currentWorkout.value = updatedWorkout
        }
    }

    function removeWorkout(id: string) {
        workouts.value = workouts.value.filter(w => w.id !== id)
        if (currentWorkout.value?.id === id) {
            currentWorkout.value = null
        }
    }

    function setCurrentWorkout(workout: Workout | null) {
        currentWorkout.value = workout
    }

    return {
        workouts,
        currentWorkout,
        lastFetched,
        setWorkouts,
        addWorkout,
        updateWorkout,
        removeWorkout,
        setCurrentWorkout
    }
}, {
    persist: true
})
