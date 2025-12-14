<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/40" @click="emit('close')"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg">
        <div class="p-4">
          <slot />
        </div>
        <div v-if="$slots.footer" class="px-4 py-3 border-t dark:border-gray-700">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
  <slot name="trigger" />
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>
