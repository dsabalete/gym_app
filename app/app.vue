<template>
  <ClientOnly>
    <AppShell>
      <NuxtPage />
    </AppShell>
    <template #fallback>
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900" />
    </template>
  </ClientOnly>
</template>
<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'
</script>
