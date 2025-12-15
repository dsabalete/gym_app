import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let db: Firestore | null = null

export function getDb(): Firestore {
  if (db) return db

  const config = useRuntimeConfig()
  const projectId = config.firebase?.projectId
  const clientEmail = config.firebase?.clientEmail
  let privateKey = config.firebase?.privateKey

  if (!projectId || !clientEmail || !privateKey) {
    throw createError({ statusCode: 500, statusMessage: 'Firebase configuration is missing' })
  }

  privateKey = privateKey.replace(/\\n/g, '\n')

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey })
    })
  }

  db = getFirestore()
  return db
}

export async function runTransaction<T>(fn: (tx: FirebaseFirestore.Transaction, db: Firestore) => Promise<T>): Promise<T> {
  const firestore = getDb()
  return firestore.runTransaction(async (tx) => fn(tx as any, firestore))
}

