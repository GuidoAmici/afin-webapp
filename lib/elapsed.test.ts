import { describe, it, expect } from 'vitest'
import { elapsedLabel, elapsedDays } from './elapsed'

const now = new Date('2026-08-03T12:00:00Z')
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString()

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe('elapsedLabel', () => {
  it('usa la unidad que le sirve a quien mira la cola', () => {
    expect(elapsedLabel(ago(30_000), now)).toBe('recién')
    expect(elapsedLabel(ago(5 * MIN), now)).toBe('hace 5 min')
    expect(elapsedLabel(ago(3 * HOUR), now)).toBe('hace 3 h')
    expect(elapsedLabel(ago(4 * DAY), now)).toBe('hace 4 días')
  })

  it('singulariza el día', () => {
    expect(elapsedLabel(ago(DAY), now)).toBe('hace 1 día')
    expect(elapsedLabel(ago(2 * DAY), now)).toBe('hace 2 días')
  })

  it('cambia de unidad justo en el borde', () => {
    expect(elapsedLabel(ago(59 * MIN), now)).toBe('hace 59 min')
    expect(elapsedLabel(ago(HOUR), now)).toBe('hace 1 h')
    expect(elapsedLabel(ago(23 * HOUR), now)).toBe('hace 23 h')
    expect(elapsedLabel(ago(DAY), now)).toBe('hace 1 día')
  })

  it('no rompe la UI con una fecha inválida', () => {
    expect(elapsedLabel('no-es-una-fecha', now)).toBe('')
  })
})

describe('elapsedDays', () => {
  it('cuenta días completos', () => {
    expect(elapsedDays(ago(0), now)).toBe(0)
    expect(elapsedDays(ago(23 * HOUR), now)).toBe(0)
    expect(elapsedDays(ago(3 * DAY + HOUR), now)).toBe(3)
  })

  it('no devuelve negativos si la fecha está en el futuro', () => {
    expect(elapsedDays(new Date(now.getTime() + DAY).toISOString(), now)).toBe(0)
  })
})
