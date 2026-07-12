import axios from 'axios'
import { getToken, setToken, clearToken } from './auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    // Rotas de /auth/* nunca disparam o fluxo de refresh. Um 401 nelas é a
    // resposta de negócio (login errado, refresh sem sessão), não um access
    // token expirado. Sem essa exclusão, um /auth/refresh que falha tenta se
    // renovar chamando a si mesmo, entrando em recursão infinita.
    const isAuthRoute = typeof originalRequest?.url === 'string' && originalRequest.url.startsWith('/auth/')
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true
      try {
        const { data } = await api.post('/auth/refresh')
        setToken(data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch {
        clearToken()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    if (!error.response) {
      error.message = 'Sem conexão com o servidor. Verifique sua internet.'
    }
    return Promise.reject(error)
  },
)