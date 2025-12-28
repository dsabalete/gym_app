<template>
  <tr class="exercises-set-row">
    <td class="px-3 py-2 text-sm text-gray-900">
      <input v-model="local.completed" type="checkbox"
        class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" @change="save" />
    </td>
    <td class="px-3 py-2 text-sm text-gray-900">
      <span class="inline-block w-16 px-2 py-1">{{ set.setNumber }}</span>
    </td>
    <td class="px-3 py-2 text-sm text-gray-900">
      <input v-model.number="local.reps" type="number" min="1" class="w-16 border rounded px-2 py-1" />
    </td>
    <td class="px-3 py-2 text-sm text-gray-900">
      <input v-model.number="local.weight" type="number" step="0.5" min="0" class="w-20 border rounded px-2 py-1" />
    </td>
    <td class="flex items-center px-3 py-2 text-sm text-gray-900 align-middle">
      <UiButton variant="secondary" size="sm" class="mr-2" @click="save">
        <span v-if="props.saving" class="inline-flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Saving…
        </span>
        <span v-else>Save</span>
      </UiButton>
      <UiButton variant="danger" size="sm" aria-label="Delete" @click="emit('remove', set)">
        <span class="inline-flex items-center gap-2">
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 3h6m-7 3h8m-9 0v13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6M10 10v8M14 10v8" />
          </svg>
          Delete
        </span>
      </UiButton>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { ExerciseSet } from '~~/types/exercise'
import { useDebounce } from '../../utils/debounce'

const props = defineProps<{
  set: ExerciseSet
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', set: ExerciseSet): void
  (e: 'remove', set: ExerciseSet): void
}>()

const local = reactive({
  reps: props.set.reps,
  weight: props.set.weight,
  completed: props.set.completed
})

function save() {
  emit('save', { ...props.set, ...local })
}

const debouncedSave = useDebounce(() => {
  emit('save', { ...props.set, ...local })
}, 500)

watch(() => local.reps, () => debouncedSave())
watch(() => local.weight, () => debouncedSave())
</script>
