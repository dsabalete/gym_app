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
      return d >= start && d < end && !!w.archived
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
