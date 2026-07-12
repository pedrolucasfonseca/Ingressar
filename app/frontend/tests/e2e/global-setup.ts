import fs from 'node:fs'
import path from 'node:path'
import { request } from '@playwright/test'
import { API_URL } from './helpers'

export const AUTH_STATE_PATH = path.join(import.meta.dirname, '.auth-state.json')

// Um organizer e um buyer únicos, criados uma vez pra toda a suíte, cada spec cria
// seus próprios eventos, mas reusa essas contas, porque /auth/register e /auth/login
// competem com o resto da API pelo mesmo authLimiter (10 req/min por IP).
export default async function globalSetup() {
  const api = await request.newContext({ baseURL: API_URL })
  const suffix = Date.now().toString(36)

  const organizer = { email: `e2e-organizer-${suffix}@test.com`, password: 'senha123' }
  const buyer = { email: `e2e-buyer-${suffix}@test.com`, password: 'senha123' }

  await api.post('/auth/register', { data: { ...organizer, name: 'E2E Organizer', role: 'organizer' } })
  await api.post('/auth/register', { data: { ...buyer, name: 'E2E Buyer', role: 'buyer' } })

  fs.writeFileSync(AUTH_STATE_PATH, JSON.stringify({ organizer, buyer, suffix }))
  await api.dispose()
}
