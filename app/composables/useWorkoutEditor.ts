import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { getDbClient } from '~/utils/firebaseClient'
import type { ExerciseSet } from '~~/types/exercise'

export function useWorkoutEditor() {
  async function updateDate(userId: string, workoutId: string, date: string) {
    const db = getDbClient()
    await updateDoc(doc(db, 'users', userId, 'workouts', workoutId), { date })
  }

  async function addExercise(userId: string, workoutId: string, name: string) {
    const db = getDbClient()
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId)
    const exercisesSnap = await getDocs(collection(workoutRef, 'exercises'))
    const order = exercisesSnap.docs.length
    await addDoc(collection(workoutRef, 'exercises'), { name, order })
  }

  async function updateExerciseOrder(userId: string, workoutId: string, exercises: any[]) {
    const db = getDbClient()
    const updates = exercises.map((ex, index) => {
      const exRef = doc(db, 'users', userId, 'workouts', workoutId, 'exercises', ex.id)
      return updateDoc(exRef, { order: index })
    })
    await Promise.all(updates)
  }

  async function addSet(userId: string, workoutId: string, exerciseId: string) {
    const db = getDbClient()
    const exRef = doc(db, 'users', userId, 'workouts', workoutId, 'exercises', exerciseId)
    const setsSnap = await getDocs(query(collection(exRef, 'sets'), orderBy('setNumber')))
    const nextNumber = setsSnap.docs.length + 1
    await addDoc(collection(exRef, 'sets'), { setNumber: nextNumber, reps: 0, weight: 0 })
  }

  async function saveSet(userId: string, workoutId: string, exerciseId: string, set: ExerciseSet) {
    const db = getDbClient()
    const setRef = doc(db, 'users', userId, 'workouts', workoutId, 'exercises', exerciseId, 'sets', set.id)
    await updateDoc(setRef, { setNumber: set.setNumber, reps: set.reps, weight: set.weight })
  }

  async function removeSet(userId: string, workoutId: string, exerciseId: string, setId: string) {
    const db = getDbClient()
    const exRef = doc(db, 'users', userId, 'workouts', workoutId, 'exercises', exerciseId)
    const setRef = doc(exRef, 'sets', setId)

    // Delete the set first
    await deleteDoc(setRef)

    // Reorder remaining sets
    const setsSnap = await getDocs(query(collection(exRef, 'sets'), orderBy('setNumber')))
    let currentNumber = 1
    const updates = []

    for (const docSnapshot of setsSnap.docs) {
      if (docSnapshot.data().setNumber !== currentNumber) {
        updates.push(updateDoc(docSnapshot.ref, { setNumber: currentNumber }))
      }
      currentNumber++
    }

    await Promise.all(updates)
  }

  async function removeExercise(userId: string, workoutId: string, exerciseId: string) {
    const db = getDbClient()
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId)
    const exRef = doc(workoutRef, 'exercises', exerciseId)

    // Delete the exercise first
    await deleteDoc(exRef)

    // Reorder remaining exercises
    const exercisesSnap = await getDocs(collection(workoutRef, 'exercises'))
    const exercises = exercisesSnap.docs
      .map(d => ({ ref: d.ref, order: d.data().order ?? 0 }))
      .sort((a, b) => a.order - b.order)

    const updates = exercises.map((ex, index) => {
      if (ex.order !== index) {
        return updateDoc(ex.ref, { order: index })
      }
      return null
    }).filter(u => u !== null)

    await Promise.all(updates)
  }

  return { updateDate, addExercise, updateExerciseOrder, addSet, saveSet, removeSet, removeExercise }
}
