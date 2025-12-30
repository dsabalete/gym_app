<template>
  <div class="mb-8 flex items-center justify-between layout-page-header">
    <div>
      <h2 class="text-3xl font-bold tracking-tight text-white">{{ title }}</h2>
      <p v-if="subtitle" class="text-base text-gray-400 mt-1">{{ subtitle }}</p>
    </div>
    <div class="flex items-center space-x-3">
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
