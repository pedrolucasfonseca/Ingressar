import { defineConfig, devices } from '@playwright/test'

// Requer a API (npm run dev em app/api) e este frontend (npm run dev) já rodando mesmo padrão do test:integration do backend, que também espera o banco de pé.
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  // 45s — o checkout real carrega Stripe.js + Payment Element + verificação
  // hCaptcha invisível, cadeia mais lenta que o default de 30s cobre com folga.
  timeout: 45_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})