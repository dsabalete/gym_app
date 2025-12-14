<template>
  <button :type="type" :disabled="disabled || loading" :class="classes" class="ui-button" @click="onClick">
    <span v-if="loading"
      class="mr-2 inline-block animate-spin rounded-full border-2 border-white/60 border-t-transparent h-4 w-4"></span>
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button'
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const base = 'inline-flex items-center justify-center rounded-lg transition-colors'
const sizeMap: Record<typeof props.size, string> = {
  sm: 'text-sm py-1.5 px-3',
  md: 'text-sm py-2 px-4',
  lg: 'text-base py-3 px-6'
}

const variantMap: Record<typeof props.variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-700'
}

const classes = computed(() => {
  const opacity = props.disabled || props.loading ? 'opacity-60 cursor-not-allowed' : ''
  return [base, sizeMap[props.size], variantMap[props.variant], opacity].join(' ')
})

function onClick(e: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', e)
}
</script>
