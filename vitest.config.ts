import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  // Mismo alias que tsconfig, para que los módulos que importan '@/...' se puedan testear.
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    environment: 'node',
    // Solo unit tests (*.test.ts). Los E2E de Playwright usan *.spec.ts.
    include: ['lib/**/*.test.ts', 'tests/unit/**/*.test.ts'],
  },
})
