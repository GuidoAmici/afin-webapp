import { describe, it, expect } from 'vitest'
import { parseFlag } from './flags'

describe('parseFlag', () => {
  it('cae al default cuando la var no está definida o está vacía', () => {
    expect(parseFlag(undefined, true)).toBe(true)
    expect(parseFlag(undefined, false)).toBe(false)
    expect(parseFlag('', true)).toBe(true)
    expect(parseFlag('   ', false)).toBe(false)
  })

  it('reconoce las formas afirmativas', () => {
    for (const raw of ['1', 'true', 'TRUE', 'on', ' On ']) {
      expect(parseFlag(raw, false)).toBe(true)
    }
  })

  it('reconoce las formas negativas', () => {
    for (const raw of ['0', 'false', 'FALSE', 'off', ' Off ']) {
      expect(parseFlag(raw, true)).toBe(false)
    }
  })

  it('cae al default ante un valor que no entiende, en vez de adivinar', () => {
    expect(parseFlag('quizás', true)).toBe(true)
    expect(parseFlag('quizás', false)).toBe(false)
  })
})
