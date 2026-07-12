import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { api } from '../lib/axios'
import { getToken, setToken, clearToken, decodeUser } from '../lib/auth'
import type { AuthUser, Role } from '../types/user'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: Role) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Ao carregar a página, o access token em memória já se perdeu. Tenta
    // renovar via refresh token (cookie httpOnly) pra restaurar a sessão sem
    // novo login.
    api
      .post('/auth/refresh')
      .then(({ data }) => {
        setToken(data.accessToken)
        setUser(decodeUser(data.accessToken))
      })
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    setToken(data.accessToken)
    setUser(decodeUser(data.accessToken))
  }, [])

  const register = useCallback(async (email: string, password: string, name: string, role: Role) => {
    await api.post('/auth/register', { email, password, name, role })
  }, [])

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => { })
    clearToken()
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}