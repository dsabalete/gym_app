import { describe, it, expect } from 'vitest'
import { computeMuscleSetsByWeek } from '../progress'

function d(offsetDays: number): string {
  const now = new Date()
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays, 12, 0, 0, 0))
  return date.toISOString()
}

describe('computeMuscleSetsByWeek', () => {
  it('agrupa sets por músculo con 0.5 en secundarios', () => {
    const workouts = [
      {
        id: 'w1',
        date: d(-2),
        archived: true,
        exercises: [
          {
            id: 'e1',
            name: 'Bench',
            primaryMuscle: 'Pecho',
            secondaryMuscle: 'Tríceps',
            order: 0,
            sets: [
              { id: 's1', setNumber: 1, reps: 8, weight: 60, completed: true },
              { id: 's2', setNumber: 2, reps: 8, weight: 60, completed: true }
            ]
          },
          {
            id: 'e2',
            name: 'Squat',
            primaryMuscle: 'Piernas',
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
            name: 'Overhead Press',
            primaryMuscle: 'Hombros',
            secondaryMuscle: 'Tríceps',
            order: 0,
            sets: [{ id: 's4', setNumber: 1, reps: 6, weight: 40, completed: true }]
          }
        ]
      }
    ] as any

    const weeks = computeMuscleSetsByWeek(workouts, 2)
    expect(weeks.length).toBe(2)
    expect(weeks[0]!.totals['Hombros']).toBe(1)
    expect(weeks[0]!.totals['Tríceps']).toBe(0.5)
    expect(weeks[0]!.totalSets).toBe(1.5)
    expect(weeks[1]!.totals['Pecho']).toBe(2)
    expect(weeks[1]!.totals['Tríceps']).toBe(1)
    expect(weeks[1]!.totals['Piernas']).toBeUndefined()
    expect(weeks[1]!.totalSets).toBe(3)
  })

  it('incluye workouts no archivados', () => {
    const workouts = [
      {
        id: 'w',
        date: d(-1),
        archived: false,
        exercises: [
          {
            id: 'e',
            name: 'Deadlift',
            primaryMuscle: 'Espalda',
            order: 0,
            sets: [{ id: 's', setNumber: 1, reps: 5, weight: 100, completed: true }]
          }
        ]
      }
    ] as any

    const weeks = computeMuscleSetsByWeek(workouts, 1)
    expect(weeks[0]!.totalSets).toBe(1)
    expect(weeks[0]!.totals['Espalda']).toBe(1)
  })
})
