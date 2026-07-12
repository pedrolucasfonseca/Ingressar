import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-ink bg-paper dark:border-ink-dark dark:bg-paper-dark">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-xl tracking-tight">
          Ingressar
        </Link>
        <div className="flex items-center gap-5 font-mono text-sm">
          {!user && (
            <>
              <Link to="/login" className="transition-colors hover:text-stamp dark:hover:text-stamp-dark">
                Entrar
              </Link>
              <Link
                to="/register"
                className="border border-ink px-3 py-1.5 transition-colors hover:bg-ink hover:text-paper dark:border-ink-dark dark:hover:bg-ink-dark dark:hover:text-paper-dark"
              >
                Criar conta
              </Link>
            </>
          )}
          {user?.role === 'buyer' && (
            <Link to="/tickets" className="transition-colors hover:text-stamp dark:hover:text-stamp-dark">
              Meus ingressos
            </Link>
          )}
          {user?.role === 'organizer' && (
            <Link to="/organizer/events" className="transition-colors hover:text-stamp dark:hover:text-stamp-dark">
              Meus eventos
            </Link>
          )}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="underline underline-offset-2 transition-colors hover:text-stamp dark:hover:text-stamp-dark"
            >
              Sair
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
