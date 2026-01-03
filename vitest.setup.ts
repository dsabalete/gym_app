import { config } from '@vue/test-utils'
import { vi } from 'vitest'

    // Mock Vue's auto-imports for Nuxt
    ; (global as any).ref = (await import('vue')).ref
    ; (global as any).computed = (await import('vue')).computed
    ; (global as any).reactive = (await import('vue')).reactive
    ; (global as any).toRef = (await import('vue')).toRef
    ; (global as any).toValue = (await import('vue')).toValue


// Configure Vue Test Utils
config.global.stubs = {
    // Add any global component stubs here if needed
}
