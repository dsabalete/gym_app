<template>
  <div class="page-archived-workouts px-4 py-6 sm:px-0">
    <LayoutPageHeader title="Archived Workouts">
      <template #actions>
        <NuxtLink to="/workouts">
          <UiButton variant="secondary">Back to Workouts</UiButton>
        </NuxtLink>
      </template>
    </LayoutPageHeader>
    <div class="mb-4 flex items-center space-x-3">
      <UiInput v-model="q" label="Search" placeholder="Search by date or exercise" />
      <UiButton variant="primary" @click="search">Search</UiButton>
      <UiButton variant="secondary" @click="reset">Reset</UiButton>
    </div>
    <UiAlert v-if="successMessage" type="success" :title="successMessage" dismissible @close="successMessage = ''" />
    <div v-if="loading" class="text-center py-8">
      <UiSkeleton class="mx-auto" width="200px" height="20px" />
      <p class="text-gray-500 mt-2">Loading archived workouts...</p>
    </div>
    <div v-else>
      <div v-if="archived.length === 0" class="text-center text-gray-500">No archived workouts</div>
      <div v-else class="space-y-4">
        <UiCard v-for="w in archived" :key="w.id" class="opacity-60">
          <template #header>
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-300">Workout {{ formatDate(w.date) }}</h3>
                <p class="text-sm text-gray-500 mt-1">Archived {{ formatDateTime(w.archiveDate) }}</p>
              </div>
              <UiButton variant="secondary" size="sm" @click="doRestore(w.id)">Restore</UiButton>
            </div>
          </template>
          <div class="flex flex-wrap gap-2">
            <span v-for="exercise in w.exercises.slice(0, 6)" :key="exercise.id"
              class="inline-block rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2 py-1">
              {{ exercise.name }}
            </span>
            <span v-if="w.exercises.length > 6"
              class="inline-block rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2 py-1">
              +{{ w.exercises.length - 6 }} more
            </span>
          </div>
        </UiCard>
      </div>
      <div v-if="hasMore" class="mt-8 flex justify-center">
        <UiButton :loading="loadingMore" variant="secondary" @click="loadMore">
          Load More
        </UiButton>
      </div>
    </div>
  </div>
  </template>
  <script setup lang="ts">
  import type { Workout } from '~~/types/workout'
  import { formatDateUTC } from '~/utils/date'
  const { uid } = useAuth()
  const { listArchived, restore } = useWorkouts()
  const archived = ref<Workout[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const offset = ref(0)
  const q = ref('')
  const successMessage = ref('')
  
  async function fetchPage(loadMore = false) {
    if (!uid.value) return
    if (loading.value || (loadMore && (!hasMore.value))) return
    if (!loadMore) {
      offset.value = 0
      archived.value = []
      hasMore.value = true
    }
    try {
      if (!loadMore) loading.value = true
      const items = await listArchived(uid.value, 10, loadMore, q.value, offset.value)
      if (items.length < 10) {
        hasMore.value = false
      } else {
        hasMore.value = true
        offset.value += items.length
      }
      archived.value = loadMore ? [...archived.value, ...items] : items
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }
  
  onMounted(() => {
    if (uid.value) {
      fetchPage(false)
    }
  })
  watch(uid, (val) => {
    if (val) {
      fetchPage(false)
    }
  })
  
  const loadMore = async () => {
    loadingMore.value = true
    await fetchPage(true)
  }
  
  const search = async () => {
    await fetchPage(false)
  }
  
  const reset = async () => {
    q.value = ''
    await fetchPage(false)
  }
  
  const formatDate = (dateString?: string | null) => {
    return dateString ? formatDateUTC(dateString as string) : ''
  }
  
  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
  }
  
  const doRestore = async (id: string) => {
    if (!confirm('Restore this workout to the main list?')) return
    if (!uid.value) return
    try {
      await restore(uid.value, id)
      successMessage.value = 'Workout restored successfully'
      await fetchPage(false)
    } catch (e) {
      alert('Failed to restore workout')
    }
  }
  </script>
