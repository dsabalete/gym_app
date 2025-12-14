<template>
  <label class="ui-input block">
    <span v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{{ label }}</span>
    <input :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="onInput"
      class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-300 dark:disabled:bg-gray-700" />
    <p v-if="hint && !error" class="mt-1 text-xs text-gray-500 dark:text-gray-300">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  hint?: string
  error?: string
  type?: string
  placeholder?: string
  disabled?: boolean
}>(), {
  type: 'text',
  placeholder: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
