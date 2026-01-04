import type { Workout } from '~~/types/workout'
import { getUTCStartOfWeek } from '~~/app/utils/date'

export interface ExerciseWeeklyTableData {
  weekLabels: string[]
  exerciseNames: string[]
  data: number[][]
}

export function computeCompletedSetsTable(
  workouts: Workout[],
  weeksCount: number = 8,
  archivedOnly: boolean = true
): ExerciseWeeklyTableData {
  const now = new Date()
  const currentWeekStart = getUTCStartOfWeek(now, 1)
  const weekMs = 7 * 24 * 60 * 60 * 1000

  const weekRanges = Array.from({ length: weeksCount }).map((_, i) => {
    const start = new Date(currentWeekStart.getTime() - (weeksCount - 1 - i) * weekMs)
    const end = new Date(start.getTime() + weekMs)
    const label = `${start.getUTCMonth() + 1}/${start.getUTCDate()}`
    return { start, end, label }
  })

  const exerciseSet = new Set<string>()
  const perWeekTotals: Array<Record<string, number>> = weekRanges.map(({ start, end }) => {
    const totals: Record<string, number> = {}
    const weekWorkouts = workouts.filter(w => {
      const d = new Date(w.date)
      const inRange = d >= start && d < end
      const archivedOk = archivedOnly ? !!w.archived : true
      return inRange && archivedOk
    })
    weekWorkouts.forEach(w => {
      w.exercises.forEach(e => {
        e.sets.forEach(s => {
          if (s.completed) {
            totals[e.name] = (totals[e.name] ?? 0) + 1
            exerciseSet.add(e.name)
          }
        })
      })
    })
    return totals
  })

  const exerciseNames = Array.from(exerciseSet).sort()
  const weekLabels = weekRanges.map(w => w.label)

  const data = exerciseNames.map(name => {
    return perWeekTotals.map(t => t[name] ?? 0)
  })

  return { weekLabels, exerciseNames, data }
}
