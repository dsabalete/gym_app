<template>
  <div class="px-4 py-6 sm:px-0">
    <PageHeader title="Progress" />
    <ProgressSummary :workouts="workouts" />
    <ClientOnly>
      <ProgressChart :workouts="workouts" />
    </ClientOnly>
  </div>
</template>
<script setup lang="ts">
const { workouts, list } = useWorkouts()
const userId = 'user123'
onMounted(() => {
  list(userId, 100)
})
</script>
