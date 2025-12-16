import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'

let db: Firestore | null = null

export function getDbClient(): Firestore {
    if (db) return db
    const config = useRuntimeConfig()
    const c = (config as any)?.public?.firebaseClient
    if (!c?.apiKey) {
        throw new Error('Firebase API key is missing. Ensure variables are set in your environment (e.g. Vercel).')
    }
    const app = getApps().length > 0 ? getApps()[0]! : initializeApp({
        apiKey: c?.apiKey,
        authDomain: c?.authDomain,
        projectId: c?.projectId,
        storageBucket: c?.storageBucket,
        messagingSenderId: c?.messagingSenderId,
        appId: c?.appId
    })
    db = getFirestore(app)
    return db
}
