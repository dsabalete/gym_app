<template>
  <label class="ui-select block">
    <span v-if="label" class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{{ label }}</span>
    <select :value="modelValue" :disabled="disabled" @change="onChange"
      class="w-full rounded-lg border border-white/10 bg-background-light text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50">
      <option v-for="opt in options" :key="String(opt.value)" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-xs text-red-400">{{ error }}</p>
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
