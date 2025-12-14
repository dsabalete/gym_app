<template>
  <section class="mb-8">
    <header v-if="title" class="mb-3">
      <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
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
