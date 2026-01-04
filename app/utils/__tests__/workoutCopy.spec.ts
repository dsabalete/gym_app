import { describe, it, expect } from 'vitest'
import { increaseRepsForExercises } from '../../utils/workoutCopy'

describe('increaseRepsForExercises', () => {
  it('increments reps by 1 for all sets', () => {
    const exercises = [
      {
        id: 'e1',
        name: 'Bench',
        order: 0,
        sets: [
          { id: 's1', setNumber: 1, reps: 8, weight: 60, completed: false },
          { id: 's2', setNumber: 2, reps: 8, weight: 60, completed: false }
        ]
      },
      {
        id: 'e2',
        name: 'Squat',
        order: 1,
        sets: [{ id: 's3', setNumber: 1, reps: 5, weight: 100, completed: false }]
      }
    ]
    const out = increaseRepsForExercises(exercises as any, 1)
    expect(out[0].sets[0].reps).toBe(9)
    expect(out[0].sets[1].reps).toBe(9)
    expect(out[1].sets[0].reps).toBe(6)
  })

  it('does not change when increment is 0', () => {
    const exercises = [
      { id: 'e', name: 'X', order: 0, sets: [{ id: 's', setNumber: 1, reps: 10, weight: 0, completed: false }] }
    ]
    const out = increaseRepsForExercises(exercises as any, 0)
    expect(out[0].sets[0].reps).toBe(10)
  })
})

