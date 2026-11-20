import { readFileSync } from 'node:fs'

import { defineConfig, devices } from '@playwright/test'

// Suite E2E LOCAL — la que puede escribir.
//
// La suite de tests/ corre contra el deploy real y verifica que el deploy, el
// dominio y la config de Supabase funcionan juntos. Esta corre contra
// `supabase start` y cubre los flujos que mutan estado, con usuarios sembrados
// (supabase/seed.sql). Requiere el stack levantado antes de correr.

process.env.PLAYWRIGHT_NO_COPY_PROMPT ??= '1'

// Puerto por worktree: dos suites en el mismo puerto se reusarían el dev server
// la una a la otra, cada una testeando el código de la otra rama. Cada worktree
// fija el suyo en .worktree-port (no versionado); PORT del entorno lo pisa.
const PORT = Number(
  process.env.PORT ??
    (() => {
      try {
        return readFileSync('.worktree-port', 'utf8').trim()
      } catch {
        return 3000
      }
    })(),
)

export default defineConfig({
  testDir: './tests/local',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  // Un worker: los tests comparten los usuarios del seed.
  workers: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
    screenshot: 'only-on-failure',
    // Sin trace: acá se tipean contraseñas y el trace las guarda en texto plano.
    trace: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // La app tiene que hablarle al stack local, no al remoto de .env.local.
    env: {
      PORT: String(PORT),
      NEXT_PUBLIC_SUPABASE_URL: process.env.LOCAL_SUPABASE_URL ?? 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.LOCAL_SUPABASE_ANON_KEY ?? '',
    },
  },
})
