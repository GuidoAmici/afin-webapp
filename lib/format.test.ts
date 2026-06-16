import { describe, it, expect } from 'vitest'
import { formatARS } from './format'

// El separador que Intl es-AR pone entre el símbolo y el monto varía según la
// versión de ICU (espacio normal, U+00A0 o U+202F). Lo colapsamos a "" para que
// el test verifique símbolo, agrupación y ausencia de decimales sin depender de
// qué espacio use el entorno.
const noSpace = (s: string) => s.replace(/\s/g, '')

describe('formatARS', () => {
  it('formatea un string numérico de Supabase como moneda sin decimales', () => {
    expect(noSpace(formatARS('1330.00'))).toBe('$1.330')
  })

  it('formatea un número', () => {
    expect(noSpace(formatARS(690))).toBe('$690')
  })

  it('redondea los centavos al no mostrar decimales', () => {
    expect(noSpace(formatARS('1003.50'))).toBe('$1.004')
  })

  it('cae a Consultar con null, undefined o string vacío', () => {
    expect(formatARS(null)).toBe('Consultar')
    expect(formatARS(undefined)).toBe('Consultar')
    expect(formatARS('')).toBe('Consultar')
  })

  it('cae a Consultar con un valor no numérico', () => {
    expect(formatARS('abc')).toBe('Consultar')
  })
})
