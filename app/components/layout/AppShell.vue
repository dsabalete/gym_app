<template>
  <div class="layout-app-shell min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-300">Gym Workout Tracker</h1>
          </div>
          <div class="flex items-center">
            <div class="hidden md:flex items-center space-x-4">
              <NuxtLink to="/" class="text-gray-600 hover:text-gray-900 dark:text-gray-100 hover:dark:text:white">
                Dashboard</NuxtLink>
              <NuxtLink to="/workouts"
                class="text-gray-600 hover:text-gray-900 dark:text-gray-100 hover:dark:text:white">Workouts</NuxtLink>
              <NuxtLink to="/progress"
                class="text-gray-600 hover:text-gray-900 dark:text-gray-100 hover:dark:text:white">Progress</NuxtLink>
              <UiThemeToggle />
              <div v-if="user" class="flex items-center ml-4 space-x-3">
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ user.displayName || user.email }}</span>
                <img v-if="user.photoURL" :src="user.photoURL" alt="User avatar" class="h-8 w-8 rounded-full">
                <button @click="handleLogout"
                  class="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                  Logout
                </button>
              </div>
            </div>
            <button
              class="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-controls="mobile-menu" :aria-expanded="mobileOpen ? 'true' : 'false'"
              @click="mobileOpen = !mobileOpen">
              <span class="sr-only">Open main menu</span>
              <svg v-if="!mobileOpen" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
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
          <NuxtLink to="/"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700">
            Dashboard</NuxtLink>
          <NuxtLink to="/workouts"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700">
            Workouts</NuxtLink>
          <NuxtLink to="/progress"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700">
            Progress</NuxtLink>
          <div class="pt-2">
            <UiThemeToggle />
          </div>
          <div v-if="user" class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center px-3 mb-3">
              <div class="flex-shrink-0">
                <img v-if="user.photoURL" :src="user.photoURL" alt="User avatar" class="h-10 w-10 rounded-full">
                <div v-else class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              </div>
              <div class="ml-3">
                <div class="text-base font-medium text-gray-800 dark:text-white">{{ user.displayName || 'User' }}</div>
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ user.email }}</div>
              </div>
            </div>
            <button @click="handleLogout"
              class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700">
              Logout
            </button>
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
const mobileOpen = ref(false)
const { user, logout } = useAuth()

const handleLogout = async () => {
  await logout()
  mobileOpen.value = false
}
</script>
