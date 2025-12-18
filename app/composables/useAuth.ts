import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User
} from 'firebase/auth'
import { getDbClient } from '~/utils/firebaseClient'

const userRef = ref<User | null>(null)
const initialLoadPromise = ref<Promise<void> | null>(null)

// Shared ready promise - initialized once and reused across all useAuth() calls
let sharedReadyPromise: Promise<void> | null = null

async function initAuth() {
  if (process.server) return

  // Ensure app is initialized
  getDbClient()
  const auth = getAuth()

  // Avoid creating multiple listeners
  if (initialLoadPromise.value) return initialLoadPromise.value

  initialLoadPromise.value = new Promise<void>((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      userRef.value = u
      // Resolve only on the first callback to unblock app init if needed
      // but we keep the listener active to update state on changes
      resolve()
    })
  })

  await initialLoadPromise.value
}

export function useAuth() {
  // Reuse the same ready promise across all calls
  if (!sharedReadyPromise) {
    sharedReadyPromise = initAuth()
  }
  const ready = sharedReadyPromise


  const login = async () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      if (result.user.email) {
        await updateProfile(result.user, {
          displayName: result.user.email
        })
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    const auth = getAuth()
    try {
      await firebaseSignOut(auth)
      userRef.value = null
      // Optional: Redirect to login page after logout
      return navigateTo('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isAuthenticated = computed(() => !!userRef.value)
  const uid = computed(() => userRef.value?.uid || '')

  return {
    user: userRef,
    uid,
    isAuthenticated,
    ready,
    login,
    logout
  }
}
