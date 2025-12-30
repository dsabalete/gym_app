<template>
  <label class="ui-input block">
    <span v-if="label" class="block text-sm font-medium text-gray-300 mb-1.5">{{ label }}</span>
    <input :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="onInput"
      class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all duration-200" />
    <p v-if="hint && !error" class="mt-1 text-xs text-gray-400">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-xs text-red-400">{{ error }}</p>
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
