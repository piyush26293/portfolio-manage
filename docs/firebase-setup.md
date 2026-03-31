# Firebase Setup Guide

1. Create a Firebase project.
2. Enable Authentication > Sign-in method > Email/Password.
3. Create a Firestore database in production mode.
4. Add a web app and copy the configuration values.
5. Copy `.env.example` to `.env` and fill in all `VITE_FIREBASE_*` values.
6. Deploy Firestore rules from `firestore.rules`.
7. Seed user documents under `users/{uid}` with one of these roles:
   - `admin`
   - `advisor` (include `assignedClientIds: string[]`)
   - `client` (include `linkedClientId: string`)
