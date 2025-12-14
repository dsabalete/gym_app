<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Gym Workout Tracker</h1>
          </div>
          <div class="flex items-center">
            <div class="hidden md:flex items-center space-x-4">
              <NuxtLink to="/" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 hover:dark:text-white">Dashboard</NuxtLink>
              <NuxtLink to="/workouts" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 hover:dark:text-white">Workouts</NuxtLink>
              <NuxtLink to="/progress" class="text-gray-600 hover:text-gray-900 dark:text-gray-300 hover:dark:text-white">Progress</NuxtLink>
              <ThemeToggle />
            </div>
            <button
              class="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-controls="mobile-menu"
              :aria-expanded="mobileOpen ? 'true' : 'false'"
              @click="mobileOpen = !mobileOpen"
            >
              <span class="sr-only">Open main menu</span>
              <svg v-if="!mobileOpen" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
    <div id="mobile-menu" class="md:hidden" v-if="mobileOpen">
      <div class="border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="px-4 py-3 space-y-2">
          <NuxtLink to="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">Dashboard</NuxtLink>
          <NuxtLink to="/workouts" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">Workouts</NuxtLink>
          <NuxtLink to="/progress" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">Progress</NuxtLink>
          <div class="pt-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '~/components/ui/ThemeToggle.vue'
const mobileOpen = ref(false)
</script>
