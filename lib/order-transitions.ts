// Espejo en TS de la máquina de estados hardcodeada en transition_order (ADR-006,
// migración 20260613231846_transition_order.sql). La autorización REAL vive en la
// función Postgres; esto solo decide qué botones ofrecer en la UI del panel —
// ocultar un botón es cosmético, no una barrera de seguridad.
//
// Niveles de actor: cliente=0, empleado=1, admin=2. Mantener sincronizado con el
// VALUES de _transition_order_core si cambia la máquina de estados en una migración.

export type Axis = 'status' | 'payment_status'

export interface Edge {
  axis: Axis
  from: string
  to: string
  /** Nivel mínimo del actor para ejecutar la transición (admin=2 = "forzar"). */
  minLevel: number
}

export const ORDER_EDGES: Edge[] = [
  // Eje logístico (status)
  { axis: 'status', from: 'pendiente', to: 'confirmado', minLevel: 1 },
  { axis: 'status', from: 'confirmado', to: 'en_preparacion', minLevel: 1 },
  { axis: 'status', from: 'en_preparacion', to: 'listo', minLevel: 1 },
  { axis: 'status', from: 'listo', to: 'despachado', minLevel: 1 },
  { axis: 'status', from: 'despachado', to: 'entregado', minLevel: 1 },
  { axis: 'status', from: 'confirmado', to: 'en_espera_stock', minLevel: 1 },
  { axis: 'status', from: 'en_preparacion', to: 'en_espera_stock', minLevel: 1 },
  { axis: 'status', from: 'en_espera_stock', to: 'en_preparacion', minLevel: 1 },
  { axis: 'status', from: 'pendiente', to: 'cancelado', minLevel: 1 },
  { axis: 'status', from: 'confirmado', to: 'cancelado', minLevel: 1 },
  { axis: 'status', from: 'en_espera_stock', to: 'cancelado', minLevel: 1 },
  { axis: 'status', from: 'en_preparacion', to: 'cancelado', minLevel: 2 }, // forzar
  { axis: 'status', from: 'listo', to: 'cancelado', minLevel: 2 }, // forzar
  { axis: 'status', from: 'despachado', to: 'cancelado', minLevel: 2 }, // forzar
  { axis: 'status', from: 'confirmado', to: 'pendiente', minLevel: 2 }, // corrección
  { axis: 'status', from: 'en_preparacion', to: 'confirmado', minLevel: 2 }, // corrección
  // Eje de pago (payment_status)
  { axis: 'payment_status', from: 'pendiente', to: 'en_revision', minLevel: 0 }, // cliente
  { axis: 'payment_status', from: 'en_revision', to: 'pagado', minLevel: 1 },
  { axis: 'payment_status', from: 'pendiente', to: 'pagado', minLevel: 1 },
  { axis: 'payment_status', from: 'en_revision', to: 'pendiente', minLevel: 1 }, // rechaza
  { axis: 'payment_status', from: 'pagado', to: 'en_revision', minLevel: 2 }, // corrección
  { axis: 'payment_status', from: 'pagado', to: 'pendiente', minLevel: 2 }, // corrección
]

/**
 * Transiciones que un miembro del staff puede ofrecer desde el estado actual.
 * Excluye las edges nivel 0 (acción de autoservicio del cliente, ej. "subí
 * comprobante"), que no tienen sentido disparadas desde el panel.
 */
export function staffTransitions(axis: Axis, from: string, actorLevel: number): Edge[] {
  return ORDER_EDGES.filter(
    e => e.axis === axis && e.from === from && e.minLevel >= 1 && e.minLevel <= actorLevel,
  )
}
