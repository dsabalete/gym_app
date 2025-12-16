<template>
  <div class="px-4 py-6 sm:px-0">
    <LayoutPageHeader title="Progress" />
    <ProgressSummary :workouts="workouts" />
    <ClientOnly>
      <ProgressChart :workouts="workouts" />
    </ClientOnly>
  </div>
</template>
<script setup lang="ts">
const { workouts, list } = useWorkouts()
const { uid, ready } = useAuth()

onMounted(async () => {
  await ready
  if (uid.value) {
    list(uid.value, 100)
  }
})
</script>
