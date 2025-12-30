<template>
  <div v-if="open" class="ui-modal fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="emit('close')"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="bg-background-light border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div class="p-6">
          <slot />
        </div>
        <div v-if="$slots.footer" class="px-6 py-4 bg-white/5 border-t border-white/10">
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
