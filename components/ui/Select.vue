<template>
  <label class="ui-select block">
    <span v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</span>
    <select :value="modelValue" :disabled="disabled" @change="onChange"
      class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100">
      <option v-for="opt in options" :key="String(opt.value)" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>

<script setup lang="ts">
type Option = { label: string; value: string | number }

const props = withDefaults(defineProps<{
  modelValue?: string | number
  options: Option[]
  label?: string
  error?: string
  disabled?: boolean
}>(), {})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const value = target.value
  emit('update:modelValue', /^\d+$/.test(value) ? Number(value) : value)
}
</script>
