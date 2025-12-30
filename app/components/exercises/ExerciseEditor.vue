<template>
  <div class="exercises-exercise-editor flex items-center gap-2 p-4 bg-background-light border border-white/5 rounded-xl">
    <UiInput v-model="localName" placeholder="New exercise name" class="flex-1" />
    <UiButton variant="primary" @click="submit">Add Exercise</UiButton>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit', value: string): void
}>()

const localName = ref(props.modelValue ?? '')

watch(localName, (v) => emit('update:modelValue', v))

function submit() {
  emit('submit', localName.value.trim())
  localName.value = ''
}
</script>
