<template>
  <div :class="classes" role="alert">
    <div class="flex items-start">
      <div class="flex-1">
        <p v-if="title" class="font-medium">{{ title }}</p>
        <p v-if="message" class="text-sm mt-1">{{ message }}</p>
        <slot />
      </div>
      <button v-if="dismissible" class="ml-4 text-sm" @click="emit('close')">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'success' | 'warning' | 'error' | 'info'
  title?: string
  message?: string
  dismissible?: boolean
}>(), {
  type: 'info',
  dismissible: false
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const classes = computed(() => {
  if (props.type === 'success') return 'rounded-lg border border-green-200 bg-green-50 text-green-800 p-3'
  if (props.type === 'warning') return 'rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 p-3'
  if (props.type === 'error') return 'rounded-lg border border-red-200 bg-red-50 text-red-800 p-3'
  return 'rounded-lg border border-blue-200 bg-blue-50 text-blue-800 p-3'
})
</script>
