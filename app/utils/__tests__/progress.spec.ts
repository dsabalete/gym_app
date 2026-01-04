import { describe, it, expect } from 'vitest'
import { computeExerciseSetsByWeek } from '../progress'

function d(offsetDays: number): string {
  const now = new Date()
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays, 12, 0, 0, 0))
  return date.toISOString()
}

describe('computeExerciseSetsByWeek', () => {
  it('agrupa sets completados en workouts archivados por ejercicio y semana', () => {
    const workouts = [
      {
        id: 'w1',
        date: d(-2),
        archived: true,
        exercises: [
          {
            id: 'e1',
            name: 'Bench',
            order: 0,
            sets: [
              { id: 's1', setNumber: 1, reps: 8, weight: 60, completed: true },
              { id: 's2', setNumber: 2, reps: 8, weight: 60, completed: true }
            ]
          },
          {
            id: 'e2',
            name: 'Squat',
            order: 1,
            sets: [{ id: 's3', setNumber: 1, reps: 5, weight: 100, completed: false }]
          }
        ]
      },
      {
        id: 'w2',
        date: d(-9),
        archived: true,
        exercises: [
          {
            id: 'e3',
            name: 'Bench',
            order: 0,
            sets: [{ id: 's4', setNumber: 1, reps: 6, weight: 62.5, completed: true }]
          }
        ]
      }
    ] as any

    const weeks = computeExerciseSetsByWeek(workouts, 2)
    expect(weeks.length).toBe(2)
    // Semana más antigua (hace ~9 días)
    expect(weeks[0]!.totals['Bench']).toBe(1)
    // Semana actual (~-2 días)
    expect(weeks[1]!.totals['Bench']).toBe(2)
    expect(weeks[1]!.totals['Squat']).toBeUndefined()
    expect(weeks[1]!.totalSets).toBe(2)
  })

  it('ignora workouts no archivados', () => {
    const workouts = [
      {
        id: 'w',
        date: d(-1),
        archived: false,
        exercises: [
          {
            id: 'e',
            name: 'Deadlift',
            order: 0,
            sets: [{ id: 's', setNumber: 1, reps: 5, weight: 100, completed: true }]
          }
        ]
      }
    ] as any

    const weeks = computeExerciseSetsByWeek(workouts, 1)
    expect(weeks[0]!.totalSets).toBe(0)
    expect(weeks[0]!.totals['Deadlift']).toBeUndefined()
  })
})
