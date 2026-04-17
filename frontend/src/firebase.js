import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

function hasFirebaseConfig(cfg) {
  return (
    !!cfg.apiKey &&
    !!cfg.authDomain &&
    !!cfg.projectId &&
    !!cfg.appId &&
    !!cfg.messagingSenderId
  )
}

export const firebaseConfigured = hasFirebaseConfig(firebaseConfig)
export const firebaseInitError = (() => {
  if (!firebaseConfigured) {
    return 'Falta configurar Firebase. Agregá VITE_FIREBASE_* en frontend/.env y reiniciá.'
  }
  return ''
})()

let _auth = null
try {
  if (firebaseConfigured) {
    const app = initializeApp(firebaseConfig)
    _auth = getAuth(app)
  }
} catch (e) {
  _auth = null
}

export const auth = _auth

