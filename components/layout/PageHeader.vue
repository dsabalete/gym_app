<template>
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm text-gray-600 dark:text-gray-200 mt-1">{{ subtitle }}</p>
    </div>
    <div class="flex items-center space-x-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
