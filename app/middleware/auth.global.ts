export default defineNuxtRouteMiddleware(async (to) => {
    const { user, ready } = useAuth()

    // Wait for auth to be initialized
    await ready

    // Allow access to login page
    if (to.path === '/login') {
        if (user.value) {
            return navigateTo('/')
        }
        return
    }

    // Redirect to login if not authenticated
    if (!user.value) {
        return navigateTo('/login')
    }
})
