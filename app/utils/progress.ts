import type { Workout } from '~~/types/workout'
import { getUTCStartOfWeek } from '~~/app/utils/date'

export interface ExerciseWeekSets {
  label: string
  start: Date
  end: Date
  totals: Record<string, number>
  totalSets: number
}

export function computeExerciseSetsByWeek(workouts: Workout[], weeksCount: number = 8): ExerciseWeekSets[] {
  const now = new Date()
  const currentWeekStart = getUTCStartOfWeek(now, 1)
  const weekMs = 7 * 24 * 60 * 60 * 1000

  const weeks = Array.from({ length: weeksCount }).map((_, i) => {
    const start = new Date(currentWeekStart.getTime() - (weeksCount - 1 - i) * weekMs)
    const end = new Date(start.getTime() + weekMs)
    const label = `${start.getUTCMonth() + 1}/${start.getUTCDate()}`

    const totals: Record<string, number> = {}
    let totalSets = 0

    const weekWorkouts = workouts.filter(w => {
      const d = new Date(w.date)
      return d >= start && d < end
    })

    weekWorkouts.forEach(w => {
      w.exercises.forEach(e => {
        e.sets.forEach(s => {
          if (s.completed) {
            totals[e.name] = (totals[e.name] ?? 0) + 1
            totalSets += 1
          }
        })
      })
    })

    return { label, start, end, totals, totalSets }
  })

  return weeks
}

export interface MuscleWeekSets {
  label: string
  start: Date
  end: Date
  totals: Record<string, number>
  totalSets: number
}

export function computeMuscleSetsByWeek(
  workouts: Workout[],
  weeksCount: number = 8,
  exerciseMuscleMap?: Record<string, { primary?: string | null; secondary?: string | null }>
): MuscleWeekSets[] {
  const now = new Date()
  const currentWeekStart = getUTCStartOfWeek(now, 1)
  const weekMs = 7 * 24 * 60 * 60 * 1000

  const weeks = Array.from({ length: weeksCount }).map((_, i) => {
    const start = new Date(currentWeekStart.getTime() - (weeksCount - 1 - i) * weekMs)
    const end = new Date(start.getTime() + weekMs)
    const label = `${start.getUTCMonth() + 1}/${start.getUTCDate()}`

    const totals: Record<string, number> = {}

    const weekWorkouts = workouts.filter(w => {
      const d = new Date(w.date)
      return d >= start && d < end
    })

    weekWorkouts.forEach(w => {
      w.exercises.forEach(e => {
        e.sets.forEach(s => {
          if (s.completed) {
            const pmDirect = e.primaryMuscle?.trim() || null
            const smDirect = e.secondaryMuscle?.trim() || null
            const lookup = exerciseMuscleMap?.[String(e.name || '').trim()]
            const pm = pmDirect ?? (lookup?.primary?.trim() || null)
            const sm = smDirect ?? (lookup?.secondary?.trim() || null)
            if (pm) {
              totals[pm] = (totals[pm] ?? 0) + 1
            }
            if (sm) {
              totals[sm] = (totals[sm] ?? 0) + 0.5
            }
          }
        })
      })
    })

    const totalSets = Object.values(totals).reduce((a, b) => a + b, 0)
    return { label, start, end, totals, totalSets }
  })

  return weeks
}
