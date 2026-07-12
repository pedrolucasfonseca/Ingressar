import type { AuthUser } from '../types/user'

// Token vive em memória (variável de módulo), não em localStorage. Some no
// refresh da página, o que é esperado: o usuário reloga via refresh token
// (cookie httpOnly).
let accessToken: string | null = null

export function getToken(): string | null {
  return accessToken
}

export function setToken(token: string): void {
  accessToken = token
}

export function clearToken(): void {
  accessToken = null
}

// O payload do JWT não é criptografado, só assinado. Decodificar no client
// pra ler { userId, role } é seguro (a verificação de assinatura já aconteceu
// no servidor pra emitir o token; o client só está lendo, não confiando
// nisso pra autorizar nada).
export function decodeUser(token: string): AuthUser | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return { id: json.userId, role: json.role }
  } catch {
    return null
  }
}