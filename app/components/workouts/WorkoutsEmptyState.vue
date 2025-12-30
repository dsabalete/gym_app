<template>
  <div class="workouts-empty-state text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </div>
    <h3 class="text-xl font-bold text-white mb-2 uppercase tracking-wide">No Workouts Yet</h3>
    <p class="text-gray-400 mb-6 max-w-sm mx-auto">Start your journey by tracking your first workout session.
      Consistency is key!</p>
    <div class="mt-4">
      <NuxtLink to="/workouts/new">
        <UiButton variant="primary">Create First Workout</UiButton>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
