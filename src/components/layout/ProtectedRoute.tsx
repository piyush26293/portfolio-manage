import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../services/useAuth'

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="p-4 text-slate-500">Loading authentication...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
