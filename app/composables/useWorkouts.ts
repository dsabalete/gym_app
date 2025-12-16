import { collection, doc, getDoc, getDocs, addDoc, deleteDoc, orderBy, limit as limitFn, query, updateDoc } from 'firebase/firestore'
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { getDbClient } from '~/utils/firebaseClient'
import type { Workout } from '~~/types/workout'
import type { Exercise, ExerciseSet } from '~~/types/exercise'

export function useWorkouts() {
  const workouts = ref<Workout[]>([])
  const workout = ref<Workout | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string>('')

  async function list(userId: string, limit = 100) {
    loading.value = true
    error.value = ''
    const db = getDbClient()
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 50
    const q = query(collection(db, 'users', userId, 'workouts'), orderBy('date', 'desc'), limitFn(safeLimit))
    const snaps = await getDocs(q)
    const result: Workout[] = []
    for (const w of snaps.docs) {
      const exercisesSnap = await getDocs(collection(w.ref, 'exercises'))
      const exercises: Exercise[] = []
      for (const ex of exercisesSnap.docs) {
        const setsSnap = await getDocs(query(collection(ex.ref, 'sets'), orderBy('setNumber')))
        const sets: ExerciseSet[] = setsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        exercises.push({ id: ex.id, ...(ex.data() as any), sets })
      }
      result.push({ id: w.id, ...(w.data() as any), exercises })
    }
    workouts.value = result
    loading.value = false
  }

  async function getById(id: string, userId: string) {
    loading.value = true
    error.value = ''
    const db = getDbClient()
    const wRef = doc(db, 'users', userId, 'workouts', id)
    const wSnap = await getDoc(wRef)
    if (!wSnap.exists()) {
      workout.value = null
      loading.value = false
      return
    }
    const exercisesSnap = await getDocs(collection(wRef, 'exercises'))
    const exercises: Exercise[] = []
    for (const ex of exercisesSnap.docs) {
      const setsSnap = await getDocs(query(collection(ex.ref, 'sets'), orderBy('setNumber')))
      const sets: ExerciseSet[] = setsSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...(d.data() as any) }))
      exercises.push({ id: ex.id, ...(ex.data() as any), sets })
    }
    workout.value = { id: wSnap.id, ...(wSnap.data() as any), exercises }
    loading.value = false
  }

  async function create(userId: string, payload: { date: string; exercises?: Array<{ name: string; sets: Array<{ setNumber: number; reps: number; weight: number }> }> }) {
    const db = getDbClient()
    const wDoc = await addDoc(collection(db, 'users', userId, 'workouts'), { date: payload.date })
    if (payload.exercises && payload.exercises.length) {
      for (const ex of payload.exercises) {
        const exDoc = await addDoc(collection(wDoc, 'exercises'), { name: ex.name })
        for (const s of ex.sets) {
          await addDoc(collection(exDoc, 'sets'), { setNumber: s.setNumber, reps: s.reps, weight: s.weight })
        }
      }
    }
    return wDoc.id
  }

  async function updateDate(userId: string, workoutId: string, date: string) {
    const db = getDbClient()
    await updateDoc(doc(db, 'users', userId, 'workouts', workoutId), { date })
  }

  async function remove(id: string, userId: string) {
    const db = getDbClient()
    await deleteDoc(doc(db, 'users', userId, 'workouts', id))
  }

  return { workouts, workout, loading, error, list, getById, create, updateDate, remove }
}
