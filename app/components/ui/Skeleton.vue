<template>
  <div :class="['animate-pulse rounded bg-white/10', sizeClass, klass]" class="ui-skeleton" />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: string
  height?: string
  class?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md'
})

const klass = computed(() => props.class ?? '')

const sizeClass = computed(() => {
  if (props.width || props.height) return ''
  if (props.size === 'sm') return 'h-3'
  if (props.size === 'lg') return 'h-6'
  return 'h-4'
})
</script>
