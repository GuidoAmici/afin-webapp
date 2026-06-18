import { describe, it, expect } from 'vitest'
import { ORDER_EDGES, staffTransitions } from './order-transitions'

// El gating de la UI vive en staffTransitions; la autorización real la repite
// transition_order en Postgres (cubierta por pgTAP). Acá fijamos que la capa
// cosmética ofrezca exactamente las acciones correctas por rol, para que el
// panel no muestre botones que la función rechazaría ni esconda los válidos.

const EMPLEADO = 1
const ADMIN = 2

function targets(axis: 'status' | 'payment_status', from: string, level: number): string[] {
  return staffTransitions(axis, from, level).map(e => e.to).sort()
}

describe('staffTransitions — eje logístico', () => {
  it('empleado desde "confirmado": protocolares, sin las admin-only', () => {
    expect(targets('status', 'confirmado', EMPLEADO)).toEqual(
      ['cancelado', 'en_espera_stock', 'en_preparacion'],
    )
  })

  it('admin desde "confirmado": además la corrección a "pendiente" (forzar)', () => {
    expect(targets('status', 'confirmado', ADMIN)).toEqual(
      ['cancelado', 'en_espera_stock', 'en_preparacion', 'pendiente'],
    )
  })

  it('empleado desde "en_preparacion" no puede cancelar (es admin-only)', () => {
    const t = targets('status', 'en_preparacion', EMPLEADO)
    expect(t).toContain('listo')
    expect(t).toContain('en_espera_stock')
    expect(t).not.toContain('cancelado')
    expect(t).not.toContain('confirmado')
  })

  it('admin desde "en_preparacion" puede forzar cancelar y corregir a "confirmado"', () => {
    const t = targets('status', 'en_preparacion', ADMIN)
    expect(t).toContain('cancelado')
    expect(t).toContain('confirmado')
  })
})

describe('staffTransitions — eje de pago', () => {
  it('empleado desde "en_revision": corroborar (pagado) o rechazar (pendiente)', () => {
    expect(targets('payment_status', 'en_revision', EMPLEADO)).toEqual(['pagado', 'pendiente'])
  })

  it('no ofrece la transición de autoservicio del cliente (pendiente→en_revision)', () => {
    expect(targets('payment_status', 'pendiente', EMPLEADO)).toEqual(['pagado'])
    expect(targets('payment_status', 'pendiente', EMPLEADO)).not.toContain('en_revision')
  })

  it('empleado no puede revertir un pago confirmado; admin sí (corrección)', () => {
    expect(targets('payment_status', 'pagado', EMPLEADO)).toEqual([])
    expect(targets('payment_status', 'pagado', ADMIN)).toEqual(['en_revision', 'pendiente'])
  })
})

describe('invariante de roles', () => {
  it('un empleado nunca recibe una transición admin-only (minLevel 2)', () => {
    for (const edge of ORDER_EDGES) {
      const offered = staffTransitions(edge.axis, edge.from, EMPLEADO)
      expect(offered.every(e => e.minLevel === 1)).toBe(true)
    }
  })
})
