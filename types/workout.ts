import type { Exercise } from './exercise'

export interface Workout {
  id: string
  date: string
  exercises: Exercise[]
}
