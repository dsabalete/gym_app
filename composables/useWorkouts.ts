import type { Workout } from '~/types/workout'
import type { ListWorkoutsResponse, GetWorkoutResponse } from '~/types/api'

export function useWorkouts() {
  const { get, post, del } = useApi()
  const workouts = ref<Workout[]>([])
  const workout = ref<Workout | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string>('')

  async function list(userId: string, limit = 100) {
    loading.value = true
    error.value = ''
    const { data, error: err } = await get<ListWorkoutsResponse>('/api/workouts', { userId, limit })
    if (err) error.value = err.message
    workouts.value = data?.workouts ?? []
    loading.value = false
  }

  async function getById(id: string, userId: string) {
    loading.value = true
    error.value = ''
    const { data, error: err } = await get<GetWorkoutResponse>(`/api/workouts/${id}`, { userId })
    if (err) error.value = err.message
    workout.value = data?.workout ?? null
    loading.value = false
  }

  async function create(userId: string, payload: { date: string }) {
    const { error: err } = await post('/api/workouts', payload, { userId })
    if (err) throw new Error(err.message)
  }

  async function remove(id: string, userId: string) {
    const { error: err } = await del(`/api/workouts/${id}`, { userId })
    if (err) throw new Error(err.message)
  }

  return { workouts, workout, loading, error, list, getById, create, remove }
}
