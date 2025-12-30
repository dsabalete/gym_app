<template>
  <section class="mb-8 layout-section">
    <header v-if="title" class="mb-4">
      <h3 class="text-lg font-bold uppercase tracking-wider text-gray-400">{{ title }}</h3>
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
