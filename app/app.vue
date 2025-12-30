<template>
  <ClientOnly>
    <AppShell>
      <NuxtPage />
    </AppShell>
    <template #fallback>
      <div class="min-h-screen bg-background" />
    </template>
  </ClientOnly>
</template>
<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'
</script>
