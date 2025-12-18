export default defineNuxtRouteMiddleware(async (to) => {
    const { user, ready } = useAuth()

    // Wait for auth to be initialized
    await ready

    // Allow access to login page (even if authenticated)
    // User will be redirected after successful login
    if (to.path === '/login') {
        return
    }

    // Redirect to login if not authenticated
    if (!user.value) {
        return navigateTo('/login')
    }
})
