import { test, expect } from '@playwright/test'
import { getSharedUsers } from './helpers'

test.describe('Login', () => {
  test('fluxo de login', async ({ page }) => {
    // test.info().testId é estável entre execuções, não serve pra unicidade.
    // O suffix do global-setup é gerado com Date.now(), único a cada run da
    // suíte.
    const { suffix } = getSharedUsers()
    const email = `e2e-login-${suffix}@test.com`
    const password = 'senha123'

    await page.goto('/register')
    await page.getByLabel('Nome').fill('E2E Login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Senha').fill(password)
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await page.waitForURL('**/login')

    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Senha').fill(password)
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('link', { name: 'Meus ingressos' })).toBeVisible()
  })

  test('exibe erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('naoexiste@test.com')
    await page.getByLabel('Senha').fill('senhaerrada')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('alert')).toBeVisible()
  })
})
