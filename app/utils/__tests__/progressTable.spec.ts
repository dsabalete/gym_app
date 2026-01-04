import { describe, it, expect } from 'vitest'
import { computeCompletedSetsTable } from '../progressTable'

function d(offsetDays: number): string {
  const now = new Date()
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays, 12, 0, 0, 0))
  return date.toISOString()
}

describe('computeCompletedSetsTable', () => {
  it('devuelve matriz de sets completados por ejercicio y semana', () => {
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
        archived: false,
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

    const out = computeCompletedSetsTable(workouts, 2, true)
    expect(out.weekLabels.length).toBe(2)
    expect(out.exerciseNames).toContain('Bench')
    expect(out.exerciseNames).not.toContain('Squat')
    const benchRow = out.data[out.exerciseNames.indexOf('Bench')]!
    expect(benchRow[0]).toBe(0)
    expect(benchRow[1]).toBe(2)
    const squatRow = out.data[out.exerciseNames.indexOf('Squat')]
    expect(squatRow).toBeUndefined()
  })

  it('filtra por archivados cuando archivedOnly es true', () => {
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

    const out = computeCompletedSetsTable(workouts, 1, true)
    expect(out.exerciseNames.length).toBe(0)
    expect(out.data.length).toBe(0)
  })
})
