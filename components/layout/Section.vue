<template>
  <section class="mb-8 layout-section">
    <header v-if="title" class="mb-3">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ title }}</h3>
    </header>
    <div>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
