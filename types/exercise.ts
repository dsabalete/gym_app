export interface ExerciseSet {
  id: string
  setNumber: number
  reps: number
  weight: number
  completed: boolean
}

export interface Exercise {
  id: string
  name: string
  primaryMuscle?: string | null
  secondaryMuscle?: string | null
  order: number
  sets: ExerciseSet[]
}
