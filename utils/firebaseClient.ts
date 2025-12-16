import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'

let db: Firestore | null = null

export function getDbClient(): Firestore {
    if (db) return db
    const config = useRuntimeConfig()
    const c = (config as any)?.public?.firebaseClient
    const app = getApps().length ? getApps()[0] : initializeApp({
        apiKey: c?.apiKey,
        authDomain: c?.authDomain,
        projectId: c?.projectId,
        storageBucket: c?.storageBucket,
        messagingSenderId: c?.messagingSenderId,
        appId: c?.appId
    })
    if (!app) throw new Error('Failed to initialize Firebase app')
    db = getFirestore(app)
    return db
}
