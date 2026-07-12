import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/axios'
import { getErrorMessage } from '../lib/errors'

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { token, password })
      navigate('/login')
    } catch (err) {
      setError(getErrorMessage(err, 'Esse link expirou ou já foi usado. Solicite um novo.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-3xl">Link inválido</h1>
        <p className="mt-4 font-mono text-sm">Esse link de redefinição não é válido.</p>
        <Link to="/forgot-password" className="mt-6 inline-block underline underline-offset-2">
          Solicitar novo link
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl">Nova senha</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="password" className="block font-mono text-xs uppercase tracking-wide text-perf">
            Nova senha
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border-b-2 border-ink bg-transparent py-1.5 dark:border-ink-dark"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-stamp dark:text-stamp-dark">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="w-full border-2 border-ink bg-stamp py-3 font-mono font-medium text-paper disabled:opacity-60 dark:border-ink-dark"
        >
          {submitting ? 'Salvando...' : 'Redefinir senha'}
        </button>
      </form>
    </div>
  )
}
