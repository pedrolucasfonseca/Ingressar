import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/axios'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/auth/forgot-password', { email })
    } finally {
      setSubmitting(false)
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-3xl">Verifique seu email</h1>
        <p role="status" className="mt-4 font-mono text-sm">
          Se esse email tiver uma conta, enviamos um link para redefinir a senha.
        </p>
        <Link to="/login" className="mt-6 inline-block underline underline-offset-2">
          Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl">Esqueci minha senha</h1>
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
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="w-full border-2 border-ink bg-stamp py-3 font-mono font-medium text-paper disabled:opacity-60 dark:border-ink-dark"
        >
          {submitting ? 'Enviando...' : 'Enviar link de redefinição'}
        </button>
      </form>
    </div>
  )
}
