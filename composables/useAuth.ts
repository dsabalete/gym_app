import { getAuth, onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth'
import { getDbClient } from '~/utils/firebaseClient'

const userRef = ref<User | null>(null)
let initialized = false

async function initAuth() {
  if (initialized) return
  // Ensure app is initialized
  getDbClient()
  const auth = getAuth()
  if (auth.currentUser) {
    userRef.value = auth.currentUser
    initialized = true
    return
  }
  try {
    await signInAnonymously(auth)
  } catch {
    // ignore and rely on onAuthStateChanged to pick up user when available
  }
  await new Promise<void>((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        userRef.value = u
        unsub()
        resolve()
      }
    })
  })
  initialized = true
}

export function useAuth() {
  const ready = (async () => {
    await initAuth()
  })()
  const uid = computed(() => userRef.value?.uid || '')
  return { user: userRef, uid, ready }
}
