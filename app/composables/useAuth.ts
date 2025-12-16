import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth'
import { getDbClient } from '~/utils/firebaseClient'

const userRef = ref<User | null>(null)
const initialLoadPromise = ref<Promise<void> | null>(null)

async function initAuth() {
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
  const ready = (async () => {
    await initAuth()
  })()

  const login = async () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
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
