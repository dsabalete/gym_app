import type { ExerciseSet } from '~/types/exercise'

export function useExercises() {
  const { post, del, patch } = useApi()

  async function addExercise(workoutId: string, name: string, userId: string) {
    const { error } = await post(`/api/workouts/${workoutId}/exercises`, { name }, { userId })
    if (error) throw new Error(error.message)
  }

  async function removeExercise(exerciseId: string, userId: string) {
    const { error } = await del(`/api/exercises/${exerciseId}`, { userId })
    if (error) throw new Error(error.message)
  }

  async function addSet(exerciseId: string, userId: string) {
    const { error } = await post(`/api/exercises/${exerciseId}/sets`, {}, { userId })
    if (error) throw new Error(error.message)
  }

  async function saveSet(set: ExerciseSet, userId: string) {
    const { error } = await patch(`/api/exercise-sets/${set.id}`, {
      setNumber: set.setNumber,
      reps: set.reps,
      weight: set.weight
    }, { userId })
    if (error) throw new Error(error.message)
  }

  async function removeSet(setId: string, userId: string) {
    const { error } = await del(`/api/exercise-sets/${setId}`, { userId })
    if (error) throw new Error(error.message)
  }

  return { addExercise, removeExercise, addSet, saveSet, removeSet }
}
