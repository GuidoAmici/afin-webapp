import { afterEach, describe, expect, test, vi } from 'vitest'
import { porEntorno } from '@/flags'

afterEach(() => vi.unstubAllEnvs())

describe('porEntorno', () => {
  test('en production devuelve el valor de producción', () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    expect(porEntorno(false)()).toBe(false)
    expect(porEntorno(true)()).toBe(true)
  })

  test('en preview y en desarrollo, encendido', () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    expect(porEntorno(false)()).toBe(true)
    vi.stubEnv('VERCEL_ENV', '')
    expect(porEntorno(false)()).toBe(true)
  })
})
