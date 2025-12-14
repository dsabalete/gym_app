<template>
  <div class="workouts-empty-state text-center py-8">
    <p class="text-gray-500">No workouts yet. Start by creating your first workout.</p>
    <div class="mt-4">
      <NuxtLink to="/workouts/new">
        <UiButton variant="primary">Create First Workout</UiButton>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'
</script>
