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
    await addDoc(collection(doc(db, 'users', userId, 'workouts', workoutId), 'exercises'), { name })
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
    const setRef = doc(db, 'users', userId, 'workouts', workoutId, 'exercises', exerciseId, 'sets', setId)
    await deleteDoc(setRef)
  }

  async function removeExercise(userId: string, workoutId: string, exerciseId: string) {
    const db = getDbClient()
    const exRef = doc(db, 'users', userId, 'workouts', workoutId, 'exercises', exerciseId)
    await deleteDoc(exRef)
  }

  return { updateDate, addExercise, addSet, saveSet, removeSet, removeExercise }
}
