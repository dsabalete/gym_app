import type { Exercise, ExerciseSet } from '~~/types/exercise'

export function increaseRepsForExercises(exercises: Exercise[], increment: number): Exercise[] {
  if (!Array.isArray(exercises) || increment === 0) return exercises
  return exercises.map((ex) => ({
    ...ex,
    sets: (ex.sets || []).map((set: ExerciseSet) => ({
      ...set,
      reps: Math.max(0, (set.reps ?? 0) + increment)
    }))
  }))
}

