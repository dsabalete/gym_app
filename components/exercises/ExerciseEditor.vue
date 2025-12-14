<template>
  <div class="exercises-exercise-editor flex items-center gap-2">
    <UiInput v-model="localName" placeholder="New exercise name" />
    <UiButton variant="primary" @click="submit">Add Exercise</UiButton>
  </div>
</template>

<script setup lang="ts">
import UiInput from '~/components/ui/Input.vue'
import UiButton from '~/components/ui/Button.vue'

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
