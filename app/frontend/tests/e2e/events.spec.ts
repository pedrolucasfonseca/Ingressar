import { test, expect } from '@playwright/test'
import { getSharedUsers, loginToken, createPublishedEvent } from './helpers'

test('listagem de eventos mostra evento publicado e leva ao detalhe', async ({ page }) => {
  const { organizer, suffix } = getSharedUsers()
  const organizerToken = await loginToken(organizer)
  const title = `Show E2E Listagem ${suffix}`
  await createPublishedEvent(organizerToken, title)

  await page.goto('/')
  const card = page.getByText(title)
  await expect(card).toBeVisible()

  await card.click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await expect(page.getByText('R$ 50,00')).toBeVisible()
})
