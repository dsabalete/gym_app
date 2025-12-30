<template>
    <div class="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8 bg-background-light p-8 rounded-3xl border border-white/5 shadow-2xl">
            <div>
                <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-white uppercase">
                    GymFlow
                </h2>
                <h3 class="mt-2 text-center text-xl font-medium text-gray-400">
                    Sign in to your account
                </h3>
            </div>
            <div class="mt-8 space-y-6">
                <button @click="handleLogin" :disabled="loading"
                    class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-background bg-primary hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(46,209,108,0.3)] hover:shadow-[0_0_20px_rgba(46,209,108,0.5)]">
                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                        <svg class="h-5 w-5 text-background/70 group-hover:text-background"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                            aria-hidden="true">
                            <path fill-rule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </span>
                    Sign in with Google
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
    layout: false
})

const { login } = useAuth()
const loading = ref(false)

const handleLogin = async () => {
    loading.value = true
    try {
        await login()
        navigateTo('/')
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}
</script>
