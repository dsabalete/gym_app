<template>
  <div class="layout-app-shell min-h-screen bg-background text-white font-sans">
    <nav class="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center gap-3">
            <!-- Logo Icon (Simple Dumbbell representation) -->
            <div class="text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                <path
                  d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.035-.84-1.875-1.875-1.875h-.75c-1.035 0-1.875.84-1.875 1.875v11.25c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V8.625Z" />
              </svg>
            </div>
            <h1 class="text-xl font-bold tracking-tight text-white uppercase">
              <NuxtLink to="/">GymFlow</NuxtLink>
            </h1>
          </div>
          <div class="flex items-center">
            <div class="hidden md:flex items-center space-x-1">
              <NuxtLink to="/"
                class="px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                active-class="text-primary bg-primary/10">
                Dashboard</NuxtLink>
              <NuxtLink to="/workouts"
                class="px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                active-class="text-primary bg-primary/10">Workouts</NuxtLink>
              <NuxtLink to="/progress"
                class="px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                active-class="text-primary bg-primary/10">Progress</NuxtLink>

              <div v-if="user" class="flex items-center ml-4 space-x-3 pl-4 border-l border-white/10">
                <span class="text-sm text-gray-300 font-medium">{{ user.displayName || user.email }}</span>
                <img v-if="user.photoURL" :src="user.photoURL" alt="User avatar"
                  class="h-9 w-9 rounded-full ring-2 ring-primary/20" referrerpolicy="no-referrer">
                <div v-else
                  class="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center ring-2 ring-primary/20">
                  <span class="text-xs font-bold">{{ (user.displayName || user.email
                    || 'U').charAt(0).toUpperCase() }}</span>
                </div>
                <button @click="handleLogout"
                  class="text-sm text-red-400 hover:text-red-300 transition-colors font-medium">
                  Logout
                </button>
              </div>
            </div>
            <button
              class="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
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
    <div id="mobile-menu" class="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/10"
      v-if="mobileOpen">
      <div class="px-4 py-3 space-y-1">
        <NuxtLink to="/"
          class="block px-3 py-2 rounded-lg text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white"
          active-class="text-primary bg-primary/10">
          Dashboard</NuxtLink>
        <NuxtLink to="/workouts"
          class="block px-3 py-2 rounded-lg text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white"
          active-class="text-primary bg-primary/10">
          Workouts</NuxtLink>
        <NuxtLink to="/progress"
          class="block px-3 py-2 rounded-lg text-base font-medium text-gray-400 hover:bg-white/5 hover:text-white"
          active-class="text-primary bg-primary/10">
          Progress</NuxtLink>
        <div v-if="user" class="pt-4 mt-2 border-t border-white/10">
          <div class="flex items-center px-3 mb-3">
            <div class="flex-shrink-0">
              <img v-if="user.photoURL" :src="user.photoURL" alt="User avatar"
                class="h-10 w-10 rounded-full ring-2 ring-primary/20" referrerpolicy="no-referrer">
              <div v-else
                class="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/20">
                <span class="text-sm font-bold text-primary">{{ (user.displayName || user.email
                  || 'U').charAt(0).toUpperCase() }}</span>
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-white">{{ user.displayName || 'User' }}</div>
              <div class="text-sm font-medium text-gray-400">{{ user.email }}</div>
            </div>
          </div>
          <button @click="handleLogout"
            class="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const mobileOpen = ref(false)
const { user, logout } = useAuth()

const handleLogout = async () => {
  await logout()
  mobileOpen.value = false
}
</script>
