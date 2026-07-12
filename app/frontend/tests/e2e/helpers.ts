import fs from "node:fs";
import { request, type APIRequestContext } from "@playwright/test";
import { AUTH_STATE_PATH } from "./global-setup";

export const API_URL = 'http://localhost:3001'

export interface TestUser {
  email: string
  password: string
}

export interface SharedUsers {
  organizer: TestUser
  buyer: TestUser
  suffix: string
}

export function getSharedUsers(): SharedUsers {
  return JSON.parse(fs.readFileSync(AUTH_STATE_PATH, 'utf-8'))
}

async function apiContext(): Promise<APIRequestContext> {
  return request.newContext({ baseURL: API_URL })
}

export async function loginToken(user: TestUser): Promise<string> {
  const api = await apiContext()
  const res = await api.post('/auth/login', { data: user })
  const { accessToken } = await res.json()
  await api.dispose()
  return accessToken as string
}

export async function createPublishedEvent(organizerToken: string, title: string): Promise<string> {
  const api = await apiContext()

  const createRes = await api.post('/events', {
    headers: { Authorization: `Bearer ${organizerToken}` },
    data: {
      title,
      description: 'Evento criado para teste E2E.',
      price: 5000,
      date: '2031-01-01T20:00:00.000Z',
      capacity: 10,
      location: 'São Paulo, SP',
    },
  })
  const event = await createRes.json()

  await api.patch(`/events/${event.id}`, {
    headers: { Authorization: `Bearer ${organizerToken}` },
    data: { status: 'published' },
  })

  await api.dispose()
  return event.id as string
}
