import { useWorkoutStore } from '~/stores/workoutStore'
import { storeToRefs } from 'pinia'
import type { Workout } from '~~/types/workout'

export function useWorkouts() {
  const store = useWorkoutStore()
  const { workouts, currentWorkout: workout } = storeToRefs(store)
  const loading = ref<boolean>(false)
  const error = ref<string>('')
  const hasMore = ref<boolean>(true)
  const offset = ref<number>(0)

  /**
   * List workouts using the server route.
   * Leverages server-side parallel fetching for efficiency.
   */
  async function list(userId: string, limitVal = 10, loadMore = false) {
    if (loading.value || (!hasMore.value && loadMore)) return

    if (workouts.value.length === 0) {
      loading.value = true
    }

    error.value = ''

    if (!loadMore) {
      offset.value = 0
    }

    try {
      const response = await $fetch<{ success: boolean; workouts: Workout[]; pagination: any }>('/api/workouts', {
        query: {
          userId,
          limit: limitVal,
          offset: offset.value
        }
      })

      if (response.success) {
        const fetchedWorkouts = response.workouts

        if (fetchedWorkouts.length < limitVal) {
          hasMore.value = false
        } else {
          hasMore.value = true
          offset.value += fetchedWorkouts.length
        }

        if (loadMore) {
          store.setWorkouts([...workouts.value, ...fetchedWorkouts])
        } else {
          store.setWorkouts(fetchedWorkouts)
        }
      }
    } catch (e: any) {
      error.value = e.statusMessage || e.message || 'Failed to fetch workouts'
    } finally {
      loading.value = false
    }
  }

  /**
   * Get a single workout by ID using the server route.
   */
  async function getById(id: string, userId: string) {
    const cached = workouts.value.find(w => w.id === id)
    if (cached) {
      store.setCurrentWorkout(cached)
    } else {
      loading.value = true
    }

    error.value = ''
    try {
      const response = await $fetch<{ success: boolean; workout: Workout }>(`/api/workouts/${id}`, {
        query: { userId }
      })

      if (response.success) {
        store.setCurrentWorkout(response.workout)
        store.updateWorkout(response.workout)
      }
    } catch (e: any) {
      error.value = e.statusMessage || e.message || 'Failed to fetch workout'
    } finally {
      loading.value = false
    }
  }

  /**
   * Reactive fetch using useFetch for components.
   * Good for initial load with lazy: true.
   */
  function useWorkoutsFetch(userId: MaybeRefOrGetter<string | null>, limitVal = 50) {
    return useFetch<{ success: boolean; workouts: Workout[] }>('/api/workouts', {
      query: {
        userId: toRef(userId),
        limit: limitVal
      },
      lazy: true,
      key: computed(() => `workouts-${toValue(userId)}`),
      watch: [toRef(userId)],
      onResponse({ response }) {
        if (response._data?.success) {
          store.setWorkouts(response._data.workouts)
        }
      }
    })
  }

  async function create(userId: string, payload: { date: string; exercises?: any[] }) {
    loading.value = true
    try {
      const response = await $fetch<{ success: boolean; workoutId: string }>('/api/workouts', {
        method: 'POST',
        body: { userId, ...payload }
      })

      if (response.success) {
        // We might want to fetch the full workout object here or just add partial to store
        // For now, let's just trigger a re-list or add optimistically if we have enough data
        // But the server does flattening, so it's better to fetch if we want the 'id's etc.
        await list(userId)
        return response.workoutId
      }
    } catch (e: any) {
      error.value = e.statusMessage || e.message || 'Failed to create workout'
    } finally {
      loading.value = false
    }
  }

  async function updateDate(userId: string, workoutId: string, date: string) {
    try {
      await $fetch(`/api/workouts/${workoutId}`, {
        method: 'PATCH',
        query: { userId },
        body: { date }
      })

      const existing = workouts.value.find(w => w.id === workoutId)
      if (existing) {
        store.updateWorkout({ ...existing, date })
      }
    } catch (e: any) {
      error.value = e.statusMessage || e.message || 'Failed to update workout date'
    }
  }

  async function remove(id: string, userId: string) {
    try {
      await $fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
        query: { userId }
      })
      store.removeWorkout(id)
    } catch (e: any) {
      error.value = e.statusMessage || e.message || 'Failed to delete workout'
    }
  }

  async function copy(userId: string, sourceWorkout: Workout, newDate: string) {
    return await create(userId, {
      date: newDate,
      exercises: sourceWorkout.exercises
    })
  }

  return {
    workouts,
    workout,
    loading,
    error,
    list,
    getById,
    create,
    updateDate,
    remove,
    copy,
    hasMore,
    useWorkoutsFetch
  }
}
