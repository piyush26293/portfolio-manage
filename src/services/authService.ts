import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

export const authService = {
  signIn: (email: string, password: string) => signInWithEmailAndPassword(auth, email, password),
  signUp: (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password),
  signOut: () => signOut(auth),
  onAuthChange: (cb: (user: User | null) => void) => onAuthStateChanged(auth, cb),
}
