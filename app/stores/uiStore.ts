import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
    const collapsedExerciseIds = ref<string[]>([])

    function isCollapsed(exerciseId: string) {
        return collapsedExerciseIds.value.includes(exerciseId)
    }

    function toggleCollapse(exerciseId: string) {
        if (collapsedExerciseIds.value.includes(exerciseId)) {
            collapsedExerciseIds.value = collapsedExerciseIds.value.filter(id => id !== exerciseId)
        } else {
            collapsedExerciseIds.value = [...collapsedExerciseIds.value, exerciseId]
        }
    }

    return {
        collapsedExerciseIds,
        isCollapsed,
        toggleCollapse
    }
}, {
    persist: true
})
