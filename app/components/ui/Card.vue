<template>
  <div class="card">
    <div v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </div>
    <div>
      <slot />
    </div>
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-white/5">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
