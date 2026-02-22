export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip auth check during SSR - auth only initializes on client
    if (import.meta.server) return

    const { user, ready } = useAuth()

    // Wait for auth to be initialized
    await ready

    // If user is authenticated and trying to access login page, redirect to home
    if (to.path === '/login' && user.value) {
        return navigateTo('/')
    }

    // Allow access to login page if not authenticated
    if (to.path === '/login') {
        return
    }

    // Redirect to login if not authenticated
    if (!user.value) {
        return navigateTo('/login')
    }
})
