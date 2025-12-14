export interface ExerciseSet {
  id: string
  setNumber: number
  reps: number
  weight: number
}

export interface Exercise {
  id: string
  name: string
  sets: ExerciseSet[]
}
