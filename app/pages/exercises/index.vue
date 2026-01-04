<template>
  <PageHeader title="Exercises" subtitle="Edit the primary and secondary muscles per exercise name" />
  <div class="bg-white/5 border border-white/10 rounded-xl p-4">
    <div v-if="pending" class="text-sm text-gray-400">Loading...</div>
    <div v-else>
      <div v-if="exercises.length === 0" class="text-sm text-gray-400">No exercises found</div>
      <div v-else class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end" v-for="ex in local" :key="ex.name">
          <div>
            <div class="text-sm font-semibold text-white">{{ ex.name }}</div>
            <div class="text-xs text-gray-400">Occurrences: {{ ex.count }}</div>
          </div>
          <div>
            <UiInput v-model="ex.primaryMuscle" label="Primary muscle" placeholder="e.g. chest, back, legs" />
          </div>
          <div>
            <UiInput v-model="ex.secondaryMuscle" label="Secondary muscle" placeholder="e.g. triceps, shoulders" />
          </div>
          <div class="flex justify-end">
            <UiButton :loading="saving[ex.name]" @click="save(ex.name, ex.primaryMuscle, ex.secondaryMuscle)">Save
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
  <UiModal :open="showSuccess" @close="showSuccess = false">
    <div class="text-sm text-gray-300">Muscles updated</div>
  </UiModal>
</template>

<script setup lang="ts">
import PageHeader from '~/components/layout/PageHeader.vue'
import UiButton from '~/components/ui/Button.vue'
import UiInput from '~/components/ui/Input.vue'
import UiModal from '~/components/ui/Modal.vue'
import { useAuth } from '~/composables/useAuth'

const { uid, ready } = useAuth()
await ready

type Aggregated = { name: string; primaryMuscle: string | null; secondaryMuscle: string | null; count: number }
const { data, pending, refresh } = useFetch<{ success: boolean; exercises: Aggregated[] }>('/api/exercises', {
  query: { userId: toRef(uid) },
  key: computed(() => `exercises-${uid.value}`),
  watch: [toRef(uid)],
  lazy: false
})

const exercises = computed(() => data.value?.exercises || [])
type AggregatedLocal = { name: string; primaryMuscle: string; secondaryMuscle: string; count: number }
const local = ref<AggregatedLocal[]>([])
watch(exercises, (v) => {
  local.value = v.map(e => ({ name: e.name, count: e.count, primaryMuscle: e.primaryMuscle ?? '', secondaryMuscle: e.secondaryMuscle ?? '' }))
}, { immediate: true })

const saving = reactive<Record<string, boolean>>({})
const showSuccess = ref(false)
const successTimer = ref<number | undefined>(undefined)

async function save(name: string, primaryMuscle: string, secondaryMuscle: string) {
  const userId = uid.value
  if (!userId || !name) return
  saving[name] = true
  try {
    await $fetch(`/api/exercises/${encodeURIComponent(name)}`, {
      method: 'patch' as any,
      query: { userId },
      body: { name, primaryMuscle: primaryMuscle.trim() || null, secondaryMuscle: secondaryMuscle.trim() || null }
    })
    showSuccess.value = true
    if (successTimer.value) {
      clearTimeout(successTimer.value)
    }
    successTimer.value = window.setTimeout(() => {
      showSuccess.value = false
    }, 1500)
    await refresh()
  } catch (e) {
  } finally {
    saving[name] = false
  }
}
</script>
