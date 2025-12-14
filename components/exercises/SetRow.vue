<template>
  <tr>
    <td class="px-3 py-2 text-sm text-gray-900">
      <input v-model.number="local.setNumber" type="number" min="1" class="w-16 border rounded px-2 py-1" />
    </td>
    <td class="px-3 py-2 text-sm text-gray-900">
      <input v-model.number="local.reps" type="number" min="1" class="w-20 border rounded px-2 py-1" />
    </td>
    <td class="px-3 py-2 text-sm text-gray-900">
      <input v-model.number="local.weight" type="number" step="0.5" min="0" class="w-24 border rounded px-2 py-1" />
    </td>
    <td class="px-3 py-2 text-sm text-gray-900">
      <UiButton variant="secondary" class="mr-2" @click="save">Save</UiButton>
      <button class="text-red-600 hover:text-red-700" @click="emit('remove', set)">Delete</button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'
import type { ExerciseSet } from '~/types/exercise'

const props = defineProps<{
  set: ExerciseSet
}>()

const emit = defineEmits<{
  (e: 'save', set: ExerciseSet): void
  (e: 'remove', set: ExerciseSet): void
}>()

const local = reactive({
  setNumber: props.set.setNumber,
  reps: props.set.reps,
  weight: props.set.weight
})

function save() {
  emit('save', { ...props.set, ...local })
}
</script>
