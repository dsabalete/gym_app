import type { Workout } from '~~/types/workout'
import { getUTCStartOfWeek } from '~~/app/utils/date'

export interface ExerciseWeeklyTableData {
  weekLabels: string[]
  exerciseNames: string[]
  data: number[][]
}

export interface MuscleWeeklyTableData {
  weekLabels: string[]
  muscleNames: string[]
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

export function computeCompletedMuscleSetsTable(
  workouts: Workout[],
  weeksCount: number = 8,
  archivedOnly: boolean = true
): MuscleWeeklyTableData {
  const now = new Date()
  const currentWeekStart = getUTCStartOfWeek(now, 1)
  const weekMs = 7 * 24 * 60 * 60 * 1000

  const weekRanges = Array.from({ length: weeksCount }).map((_, i) => {
    const start = new Date(currentWeekStart.getTime() - (weeksCount - 1 - i) * weekMs)
    const end = new Date(start.getTime() + weekMs)
    const label = `${start.getUTCMonth() + 1}/${start.getUTCDate()}`
    return { start, end, label }
  })

  const nameToMuscle: Record<string, { primary?: string | null; secondary?: string | null }> = {}
  workouts.forEach(w => {
    w.exercises.forEach(e => {
      const key = String(e.name || '').trim()
      if (!key) return
      const pm = e.primaryMuscle?.trim() || null
      const sm = e.secondaryMuscle?.trim() || null
      if (!nameToMuscle[key]) nameToMuscle[key] = {}
      if (pm) nameToMuscle[key].primary = pm
      if (sm) nameToMuscle[key].secondary = sm
    })
  })

  const muscleSet = new Set<string>()
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
            const lookup = nameToMuscle[String(e.name || '').trim()]
            const pm = e.primaryMuscle?.trim() || lookup?.primary?.trim() || null
            const sm = e.secondaryMuscle?.trim() || lookup?.secondary?.trim() || null
            if (pm) {
              totals[pm] = (totals[pm] ?? 0) + 1
              muscleSet.add(pm)
            }
            if (sm) {
              totals[sm] = (totals[sm] ?? 0) + 0.5
              muscleSet.add(sm)
            }
          }
        })
      })
    })
    return totals
  })

  const muscleNames = Array.from(muscleSet).sort()
  const weekLabels = weekRanges.map(w => w.label)

  const data = muscleNames.map(name => {
    return perWeekTotals.map(t => t[name] ?? 0)
  })

  return { weekLabels, muscleNames, data }
}

export function computeAllExercisesWeeklyTable(
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

  // 1. Collect ALL exercise names from ALL provided workouts (not just within the time window)
  const exerciseSet = new Set<string>()
  workouts.forEach(w => {
    // If archivedOnly is true, should we consider exercises from non-archived workouts?
    // "todos los ejercicios que hay en la base de datos" implies all known exercises.
    // But usually we care about completed exercises if we talk about sets.
    // Let's include all exercises found in any workout passed to us.
    w.exercises.forEach(e => exerciseSet.add(e.name))
  })

  const exerciseNames = Array.from(exerciseSet).sort()
  const weekLabels = weekRanges.map(w => w.label)

  // 2. Compute totals per week
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
          }
        })
      })
    })
    return totals
  })

  const data = exerciseNames.map(name => {
    return perWeekTotals.map(t => t[name] ?? 0)
  })

  return { weekLabels, exerciseNames, data }
}
