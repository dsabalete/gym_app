import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { getDbClient } from '~/utils/firebaseClient'
import type { ExerciseSet } from '~~/types/exercise'
import { useWorkoutStore } from '~/stores/workoutStore'

export function useWorkoutEditor() {
  const store = useWorkoutStore()

  async function updateDate(userId: string, workoutId: string, date: string) {
    const db = getDbClient()
    const updateData = {
      date,
      updatedAt: new Date().toISOString()
    }
    await updateDoc(doc(db, 'users', userId, 'workouts', workoutId), updateData)

    // Sync store
    const existing = store.workouts.find(w => w.id === workoutId)
    if (existing) {
      store.updateWorkout({ ...existing, ...updateData })
    }
  }

  async function addExercise(userId: string, workoutId: string, name: string) {
    const db = getDbClient()
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId)
    const workoutSnap = await getDoc(workoutRef)
    if (!workoutSnap.exists()) return

    const exercises = workoutSnap.data().exercises || []
    const newExercise = {
      id: crypto.randomUUID(),
      name,
      order: exercises.length,
      sets: []
    }

    const updatedExercises = [...exercises, newExercise]
    const updateData = {
      exercises: updatedExercises,
      updatedAt: new Date().toISOString()
    }

    await updateDoc(workoutRef, updateData)

    // Sync store
    const existing = store.workouts.find(w => w.id === workoutId)
    if (existing) {
      store.updateWorkout({ ...existing, ...updateData })
    }
  }

  async function updateExerciseOrder(userId: string, workoutId: string, exercises: any[]) {
    const db = getDbClient()
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId)

    const reorderedExercises = exercises.map((ex, index) => ({
      ...ex,
      order: index
    }))

    const updateData = {
      exercises: reorderedExercises,
      updatedAt: new Date().toISOString()
    }

    await updateDoc(workoutRef, updateData)

    // Sync store
    const existing = store.workouts.find(w => w.id === workoutId)
    if (existing) {
      store.updateWorkout({ ...existing, ...updateData })
    }
  }

  async function addSet(userId: string, workoutId: string, exerciseId: string) {
    const db = getDbClient()
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId)
    const workoutSnap = await getDoc(workoutRef)
    if (!workoutSnap.exists()) return

    const exercises = [...(workoutSnap.data().exercises || [])]
    const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId)
    if (exerciseIndex === -1) return

    const exercise = exercises[exerciseIndex]!
    const nextNumber = (exercise.sets || []).length + 1
    const newSet = {
      id: crypto.randomUUID(),
      setNumber: nextNumber,
      reps: 0,
      weight: 0
    }

    exercise.sets = [...(exercise.sets || []), newSet]
    exercises[exerciseIndex] = exercise

    const updateData = {
      exercises,
      updatedAt: new Date().toISOString()
    }

    await updateDoc(workoutRef, updateData)

    // Sync store
    const existing = store.workouts.find(w => w.id === workoutId)
    if (existing) {
      store.updateWorkout({ ...existing, ...updateData })
    }
  }

  async function saveSet(userId: string, workoutId: string, exerciseId: string, set: ExerciseSet) {
    const db = getDbClient()
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId)
    const workoutSnap = await getDoc(workoutRef)
    if (!workoutSnap.exists()) return

    const exercises = [...(workoutSnap.data().exercises || [])]
    const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId)
    if (exerciseIndex === -1) return

    const exercise = exercises[exerciseIndex]!
    const setIndex = exercise.sets.findIndex((s: any) => s.id === set.id)
    if (setIndex === -1) return

    exercise.sets[setIndex] = { ...set }
    exercises[exerciseIndex] = exercise

    const updateData = {
      exercises,
      updatedAt: new Date().toISOString()
    }

    await updateDoc(workoutRef, updateData)

    // Sync store
    const existing = store.workouts.find(w => w.id === workoutId)
    if (existing) {
      store.updateWorkout({ ...existing, ...updateData })
    }
  }

  async function removeSet(userId: string, workoutId: string, exerciseId: string, setId: string) {
    const db = getDbClient()
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId)
    const workoutSnap = await getDoc(workoutRef)
    if (!workoutSnap.exists()) return

    const exercises = [...(workoutSnap.data().exercises || [])]
    const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId)
    if (exerciseIndex === -1) return

    const exercise = exercises[exerciseIndex]!
    exercise.sets = exercise.sets.filter((s: any) => s.id !== setId)

    // Reorder remaining sets
    exercise.sets = exercise.sets.sort((a: any, b: any) => a.setNumber - b.setNumber)
    exercise.sets.forEach((s: any, index: number) => {
      s.setNumber = index + 1
    })

    exercises[exerciseIndex] = exercise

    const updateData = {
      exercises,
      updatedAt: new Date().toISOString()
    }

    await updateDoc(workoutRef, updateData)

    // Sync store
    const existing = store.workouts.find(w => w.id === workoutId)
    if (existing) {
      store.updateWorkout({ ...existing, ...updateData })
    }
  }

  async function removeExercise(userId: string, workoutId: string, exerciseId: string) {
    const db = getDbClient()
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId)
    const workoutSnap = await getDoc(workoutRef)
    if (!workoutSnap.exists()) return

    let exercises = (workoutSnap.data().exercises || []).filter((ex: any) => ex.id !== exerciseId)

    // Reorder remaining exercises
    exercises = exercises.sort((a: any, b: any) => a.order - b.order)
    exercises.forEach((ex: any, index: number) => {
      ex.order = index
    })

    const updateData = {
      exercises,
      updatedAt: new Date().toISOString()
    }

    await updateDoc(workoutRef, updateData)

    // Sync store
    const existing = store.workouts.find(w => w.id === workoutId)
    if (existing) {
      store.updateWorkout({ ...existing, ...updateData })
    }
  }

  return { updateDate, addExercise, updateExerciseOrder, addSet, saveSet, removeSet, removeExercise }
}
