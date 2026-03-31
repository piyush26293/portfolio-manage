import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

const mockUser = {
  uid: 'local-admin',
  email: 'admin@example.com',
} as User

export const authService = {
  signIn: (email: string, password: string) => {
    if (!auth) {
      if (!email || !password) return Promise.reject(new Error('Email and password are required.'))
      return Promise.resolve({ user: { ...mockUser, email } } as { user: User })
    }
    return signInWithEmailAndPassword(auth, email, password)
  },
  signUp: (email: string, password: string) => {
    if (!auth) {
      if (!email || !password) return Promise.reject(new Error('Email and password are required.'))
      return Promise.resolve({ user: { ...mockUser, email } } as { user: User })
    }
    return createUserWithEmailAndPassword(auth, email, password)
  },
  signOut: () => {
    if (!auth) return Promise.resolve()
    return signOut(auth)
  },
  onAuthChange: (cb: (user: User | null) => void) => {
    if (!auth) {
      cb(mockUser)
      return () => {}
    }
    return onAuthStateChanged(auth, cb)
  },
}
