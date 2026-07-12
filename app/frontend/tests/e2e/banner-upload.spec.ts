import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from '@playwright/test'
import { getSharedUsers, loginToken, createPublishedEvent } from './helpers'

const fixturesDir = path.dirname(fileURLToPath(import.meta.url))

test('upload de banner no formulário do organizer', async ({ page }) => {
  const { organizer, suffix } = getSharedUsers()
  const organizerToken = await loginToken(organizer)
  const title = `Show E2E Banner ${suffix}`
  const eventId = await createPublishedEvent(organizerToken, title)

  await page.goto('/login')
  await page.getByLabel('Email').fill(organizer.email)
  await page.getByLabel('Senha').fill(organizer.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('link', { name: 'Meus eventos' })).toBeVisible()

  await page.goto(`/organizer/events/${eventId}/edit`)
  await page.locator('#banner').setInputFiles(path.join(fixturesDir, 'fixtures', 'banner.png'))

  await expect(page.locator('img[alt=""]')).toBeVisible({ timeout: 10000 })
})
