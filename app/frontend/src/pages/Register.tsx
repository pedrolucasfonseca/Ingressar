import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../lib/errors'
import type { Role } from '../types/user'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('buyer')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await register(email, password, name, role)
      navigate('/login')
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível criar a conta.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl">Criar conta</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <fieldset className="flex gap-2 font-mono text-sm">
          <legend className="mb-1 block font-mono text-xs uppercase tracking-wide text-perf">Quero</legend>
          <button
            type="button"
            onClick={() => setRole('buyer')}
            aria-pressed={role === 'buyer'}
            className={`flex-1 border-2 py-2 ${role === 'buyer' ? 'border-ink bg-ink text-paper dark:border-ink-dark dark:bg-ink-dark dark:text-paper-dark' : 'border-ink dark:border-ink-dark'}`}
          >
            Comprar ingressos
          </button>
          <button
            type="button"
            onClick={() => setRole('organizer')}
            aria-pressed={role === 'organizer'}
            className={`flex-1 border-2 py-2 ${role === 'organizer' ? 'border-ink bg-ink text-paper dark:border-ink-dark dark:bg-ink-dark dark:text-paper-dark' : 'border-ink dark:border-ink-dark'}`}
          >
            Organizar eventos
          </button>
        </fieldset>
        <div>
          <label htmlFor="name" className="block font-mono text-xs uppercase tracking-wide text-perf">
            Nome
          </label>
          <input
            id="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border-b-2 border-ink bg-transparent py-1.5 dark:border-ink-dark"
          />
        </div>
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
          {submitting ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
      <p className="mt-6 font-mono text-sm">
        Já tem conta? <Link to="/login" className="underline underline-offset-2">Entrar</Link>
      </p>
    </div>
  )
}
