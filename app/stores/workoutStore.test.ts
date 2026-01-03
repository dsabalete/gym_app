import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWorkoutStore } from './workoutStore'
import type { Workout } from '~~/types/workout'




describe('workoutStore', () => {
    beforeEach(() => {
        // Create a fresh pinia instance before each test
        setActivePinia(createPinia())
    })

    it('initializes with empty state', () => {
        const store = useWorkoutStore()

        expect(store.workouts).toEqual([])
        expect(store.currentWorkout).toBeNull()
        expect(store.lastFetched).toBeNull()
    })

    describe('setWorkouts', () => {
        it('sets workouts array', () => {
            const store = useWorkoutStore()
            const mockWorkouts: Workout[] = [
                { id: '1', date: '2024-01-01', exercises: [] },
                { id: '2', date: '2024-01-02', exercises: [] }
            ]

            store.setWorkouts(mockWorkouts)

            expect(store.workouts).toEqual(mockWorkouts)
            expect(store.workouts.length).toBe(2)
        })

        it('updates lastFetched timestamp', () => {
            const store = useWorkoutStore()
            const beforeTime = Date.now()

            store.setWorkouts([])

            expect(store.lastFetched).not.toBeNull()
            expect(store.lastFetched).toBeGreaterThanOrEqual(beforeTime)
        })

        it('replaces existing workouts', () => {
            const store = useWorkoutStore()
            const firstSet: Workout[] = [{ id: '1', date: '2024-01-01', exercises: [] }]
            const secondSet: Workout[] = [{ id: '2', date: '2024-01-02', exercises: [] }]

            store.setWorkouts(firstSet)
            expect(store.workouts.length).toBe(1)

            store.setWorkouts(secondSet)
            expect(store.workouts.length).toBe(1)
            expect(store.workouts[0]!.id).toBe('2')
        })
    })

    describe('addWorkout', () => {
        it('adds a workout to the beginning of the array', () => {
            const store = useWorkoutStore()
            const existing: Workout[] = [{ id: '1', date: '2024-01-01', exercises: [] }]
            const newWorkout: Workout = { id: '2', date: '2024-01-02', exercises: [] }

            store.setWorkouts(existing)
            store.addWorkout(newWorkout)

            expect(store.workouts.length).toBe(2)
            expect(store.workouts[0]!.id).toBe('2') // New workout should be first
            expect(store.workouts[1]!.id).toBe('1')
        })

        it('adds to empty array', () => {
            const store = useWorkoutStore()
            const newWorkout: Workout = { id: '1', date: '2024-01-01', exercises: [] }

            store.addWorkout(newWorkout)

            expect(store.workouts.length).toBe(1)
            expect(store.workouts[0]).toEqual(newWorkout)
        })
    })

    describe('updateWorkout', () => {
        it('updates an existing workout in the array', () => {
            const store = useWorkoutStore()
            const workouts: Workout[] = [
                { id: '1', date: '2024-01-01', exercises: [] },
                { id: '2', date: '2024-01-02', exercises: [] }
            ]
            store.setWorkouts(workouts)

            const updated: Workout = {
                id: '1',
                date: '2024-01-03',
                exercises: [{ id: 'e1', name: 'Bench Press', order: 0, sets: [] }]
            }
            store.updateWorkout(updated)

            expect(store.workouts[0]!.date).toBe('2024-01-03')
            expect(store.workouts[0]!.exercises.length).toBe(1)
        })

        it('updates currentWorkout if it matches', () => {
            const store = useWorkoutStore()
            const workout: Workout = { id: '1', date: '2024-01-01', exercises: [] }

            store.setWorkouts([workout])
            store.setCurrentWorkout(workout)

            const updated: Workout = { id: '1', date: '2024-01-02', exercises: [] }
            store.updateWorkout(updated)

            expect(store.currentWorkout?.date).toBe('2024-01-02')
        })

        it('does not update currentWorkout if id does not match', () => {
            const store = useWorkoutStore()
            const workout1: Workout = { id: '1', date: '2024-01-01', exercises: [] }
            const workout2: Workout = { id: '2', date: '2024-01-02', exercises: [] }

            store.setWorkouts([workout1, workout2])
            store.setCurrentWorkout(workout1)

            const updated: Workout = { id: '2', date: '2024-01-03', exercises: [] }
            store.updateWorkout(updated)

            expect(store.currentWorkout?.id).toBe('1')
            expect(store.currentWorkout?.date).toBe('2024-01-01')
        })

        it('does nothing if workout id is not found', () => {
            const store = useWorkoutStore()
            const workouts: Workout[] = [{ id: '1', date: '2024-01-01', exercises: [] }]
            store.setWorkouts(workouts)

            const updated: Workout = { id: '999', date: '2024-01-02', exercises: [] }
            store.updateWorkout(updated)

            expect(store.workouts.length).toBe(1)
            expect(store.workouts[0]!.id).toBe('1')
        })
    })

    describe('removeWorkout', () => {
        it('removes a workout from the array', () => {
            const store = useWorkoutStore()
            const workouts: Workout[] = [
                { id: '1', date: '2024-01-01', exercises: [] },
                { id: '2', date: '2024-01-02', exercises: [] },
                { id: '3', date: '2024-01-03', exercises: [] }
            ]
            store.setWorkouts(workouts)

            store.removeWorkout('2')

            expect(store.workouts.length).toBe(2)
            expect(store.workouts.find((w: Workout) => w.id === '2')).toBeUndefined()
            expect(store.workouts[0]!.id).toBe('1')
            expect(store.workouts[1]!.id).toBe('3')
        })

        it('clears currentWorkout if it matches removed workout', () => {
            const store = useWorkoutStore()
            const workout: Workout = { id: '1', date: '2024-01-01', exercises: [] }

            store.setWorkouts([workout])
            store.setCurrentWorkout(workout)

            store.removeWorkout('1')

            expect(store.currentWorkout).toBeNull()
        })

        it('does not clear currentWorkout if id does not match', () => {
            const store = useWorkoutStore()
            const workout1: Workout = { id: '1', date: '2024-01-01', exercises: [] }
            const workout2: Workout = { id: '2', date: '2024-01-02', exercises: [] }

            store.setWorkouts([workout1, workout2])
            store.setCurrentWorkout(workout1)

            store.removeWorkout('2')

            expect(store.currentWorkout?.id).toBe('1')
        })

        it('does nothing if workout id is not found', () => {
            const store = useWorkoutStore()
            const workouts: Workout[] = [{ id: '1', date: '2024-01-01', exercises: [] }]
            store.setWorkouts(workouts)

            store.removeWorkout('999')

            expect(store.workouts.length).toBe(1)
        })
    })

    describe('setCurrentWorkout', () => {
        it('sets the current workout', () => {
            const store = useWorkoutStore()
            const workout: Workout = { id: '1', date: '2024-01-01', exercises: [] }

            store.setCurrentWorkout(workout)

            expect(store.currentWorkout).toEqual(workout)
        })

        it('can set current workout to null', () => {
            const store = useWorkoutStore()
            const workout: Workout = { id: '1', date: '2024-01-01', exercises: [] }

            store.setCurrentWorkout(workout)
            expect(store.currentWorkout).not.toBeNull()

            store.setCurrentWorkout(null)
            expect(store.currentWorkout).toBeNull()
        })

        it('can change current workout', () => {
            const store = useWorkoutStore()
            const workout1: Workout = { id: '1', date: '2024-01-01', exercises: [] }
            const workout2: Workout = { id: '2', date: '2024-01-02', exercises: [] }

            store.setCurrentWorkout(workout1)
            expect(store.currentWorkout?.id).toBe('1')

            store.setCurrentWorkout(workout2)
            expect(store.currentWorkout?.id).toBe('2')
        })
    })
})
