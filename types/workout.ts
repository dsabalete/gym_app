import type { Exercise } from './exercise'

export interface Workout {
  id: string
  date: string
  archived?: boolean
  archiveDate?: string | null
  exercises: Exercise[]
}
