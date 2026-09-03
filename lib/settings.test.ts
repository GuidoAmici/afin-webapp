import { describe, it, expect } from 'vitest'
import { parseOpsFlag } from './settings'

describe('parseOpsFlag', () => {
  it('toma el booleano de JSONB tal cual', () => {
    expect(parseOpsFlag(true, false)).toBe(true)
    expect(parseOpsFlag(false, true)).toBe(false)
  })

  it('acepta las formas de texto, por si alguien cargó la key a mano', () => {
    expect(parseOpsFlag('true', false)).toBe(true)
    expect(parseOpsFlag('off', true)).toBe(false)
    expect(parseOpsFlag('1', false)).toBe(true)
  })

  it('cae al default ante null, números u objetos', () => {
    expect(parseOpsFlag(null, true)).toBe(true)
    expect(parseOpsFlag(undefined, false)).toBe(false)
    expect(parseOpsFlag(1, false)).toBe(false)
    expect(parseOpsFlag({ enabled: true }, false)).toBe(false)
  })
})
