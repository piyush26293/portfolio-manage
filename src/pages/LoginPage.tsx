import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form
        className="w-full max-w-sm rounded border border-slate-200 bg-white p-6 shadow"
        onSubmit={async (event) => {
          event.preventDefault()
          setLoading(true)
          setError(null)
          try {
            await authService.signIn(email, password)
            navigate('/')
          } catch (err) {
            setError((err as Error).message)
          } finally {
            setLoading(false)
          }
        }}
      >
        <h1 className="mb-4 text-xl font-semibold text-slate-800">Portfolio Manage Login</h1>
        <label className="mb-3 block text-sm text-slate-600">
          Email
          <input
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="mb-4 block text-sm text-slate-600">
          Password
          <input
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}
        <button
          className="w-full rounded bg-indigo-600 px-3 py-2 text-sm text-white disabled:bg-slate-400"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
