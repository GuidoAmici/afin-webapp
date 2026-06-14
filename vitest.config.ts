import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Solo unit tests (*.test.ts). Los E2E de Playwright usan *.spec.ts.
    include: ['lib/**/*.test.ts', 'tests/unit/**/*.test.ts'],
  },
})
