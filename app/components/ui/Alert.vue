<template>
  <div :class="classes" class="ui-alert" role="alert">
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
  if (props.type === 'success') return 'rounded-lg border border-primary/20 bg-primary/10 text-primary p-3'
  if (props.type === 'warning') return 'rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 p-3'
  if (props.type === 'error') return 'rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 p-3'
  return 'rounded-lg border border-white/20 bg-white/10 text-white p-3'
})
</script>
