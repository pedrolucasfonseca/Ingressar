import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../lib/errors'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'Email ou senha incorretos.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl">Entrar</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block font-mono text-xs uppercase tracking-wide text-perf">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border-b-2 border-ink bg-transparent py-1.5 dark:border-ink-dark"
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-mono text-xs uppercase tracking-wide text-perf">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
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
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-6 font-mono text-sm">
        Não tem conta? <Link to="/register" className="underline underline-offset-2">Criar conta</Link>
      </p>
      <p className="mt-2 font-mono text-sm">
        <Link to="/forgot-password" className="underline underline-offset-2">Esqueci minha senha</Link>
      </p>
    </div>
  )
}
