import { describe, it, expect } from 'vitest'
import { filterOutArchived, searchArchived } from './workoutsHelpers'

describe('workoutsHelpers', () => {
  it('filters out archived workouts', () => {
    const items = [
      { id: '1', archived: true },
      { id: '2', archived: false },
      { id: '3' }
    ]
    const result = filterOutArchived(items)
    expect(result.map(i => i.id)).toEqual(['2', '3'])
  })

  it('searches archived workouts by date and exercise names', () => {
    const items = [
      { id: '1', date: '2024-01-01', exercises: [{ name: 'Bench Press' }, { name: 'Row' }] },
      { id: '2', date: '2024-02-01', exercises: [{ name: 'Squat' }] },
      { id: '3', date: '2024-03-01', exercises: [{ name: 'Deadlift' }] }
    ]
    expect(searchArchived(items, 'bench').map(i => i.id)).toEqual(['1'])
    expect(searchArchived(items, '2024-02').map(i => i.id)).toEqual(['2'])
    expect(searchArchived(items, '').map(i => i.id)).toEqual(['1', '2', '3'])
  })
})
