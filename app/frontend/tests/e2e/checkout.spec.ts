import { test, expect } from '@playwright/test'
import { getSharedUsers, loginToken, createPublishedEvent } from './helpers'

// Requer acesso de rede real do browser a js.stripe.com (carrega o Payment
// Element num iframe do domínio da Stripe). Não roda em ambientes sem saída
// à internet.
test('fluxo completo de compra em modo test', async ({ page }) => {
  const { organizer, buyer, suffix } = getSharedUsers()
  const organizerToken = await loginToken(organizer)
  const title = `Show E2E Compra ${suffix}`
  await createPublishedEvent(organizerToken, title)

  await page.goto('/login')
  await page.getByLabel('Email').fill(buyer.email)
  await page.getByLabel('Senha').fill(buyer.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('link', { name: 'Meus ingressos' })).toBeVisible()

  await page.goto('/')
  await page.getByText(title).click()
  await page.getByRole('link', { name: 'Comprar ingresso' }).click()
  await page.waitForURL('**/checkout/**')

  const cardFrame = page.frameLocator('iframe[title="Secure payment input frame"]').first()
  await cardFrame.locator('input[name="number"]').waitFor({ timeout: 30000 })
  await cardFrame.locator('input[name="number"]').fill('4242424242424242')
  await cardFrame.locator('input[name="expiry"]').fill('12/34')
  await cardFrame.locator('input[name="cvc"]').fill('123')

  await page.getByRole('button', { name: 'Pagar' }).click()
  await page.waitForURL('**/tickets/**', { timeout: 30000 })

  // Confirmação real do pagamento é assíncrona via webhook, o ticket fica "pending" até lá, o teste garante o fluxo até aqui.
  await expect(page.getByText(/aguardando confirmação do pagamento/i)).toBeVisible()
})
