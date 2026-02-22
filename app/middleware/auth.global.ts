export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip auth check during SSR - auth only initializes on client
    if (import.meta.server) return

    const { user, ready } = useAuth()

    // Wait for auth to be initialized
    await ready

    // Double-check Firebase's currentUser as a fallback
    // (onAuthStateChanged might not fire in some edge cases)
    if (!user.value) {
        const { getAuth } = await import('firebase/auth')
        const auth = getAuth()
        if (auth.currentUser) {
            user.value = auth.currentUser
        }
    }

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
