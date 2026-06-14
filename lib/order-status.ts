// Fuente de verdad única del eje logístico de un pedido (ADR-005).
// Alineado con el CHECK de orders.status en supabase/migrations (fase 2):
//   pendiente · confirmado · en_preparacion · listo ·
//   despachado · entregado · en_espera_stock · cancelado
//
// Tanto el panel del cliente como el de empleados consumen este módulo, así
// el vocabulario y los colores quedan consistentes entre ambos. Los colores
// son tokens del design system (globals.css) — nunca hex crudos — para que
// el modo oscuro funcione solo. Para fondos tinteados usar statusTint().

export type OrderStatus =
  | 'pendiente'
  | 'confirmado'
  | 'en_preparacion'
  | 'listo'
  | 'despachado'
  | 'entregado'
  | 'en_espera_stock'
  | 'cancelado'

interface StatusMeta {
  /** Etiqueta visible al usuario. */
  label: string
  /** Token de color del design system (var(--…)). */
  color: string
}

// Rampa de progreso: naranja durante preparación → verde al despachar/entregar.
// warning para estados que esperan acción, error para cancelado.
export const ORDER_STATUS: Record<OrderStatus, StatusMeta> = {
  pendiente:       { label: 'Pendiente',        color: 'var(--warning-500)' },
  confirmado:      { label: 'Confirmado',       color: 'var(--orange-500)'  },
  en_preparacion:  { label: 'En preparación',   color: 'var(--orange-600)'  },
  listo:           { label: 'Listo',            color: 'var(--orange-700)'  },
  despachado:      { label: 'Despachado',       color: 'var(--success-500)' },
  entregado:       { label: 'Entregado',        color: 'var(--success-700)' },
  en_espera_stock: { label: 'En espera de stock', color: 'var(--warning-700)' },
  cancelado:       { label: 'Cancelado',        color: 'var(--error-500)'   },
}

const FALLBACK: StatusMeta = { label: 'Pendiente', color: 'var(--warning-500)' }

/** Meta de un status; tolera valores fuera del enum sin romper la UI. */
export function statusMeta(status: string): StatusMeta {
  return ORDER_STATUS[status as OrderStatus] ?? FALLBACK
}

/** Fondo tinteado del color de estado, derivado vía color-mix (adapta a tema). */
export function statusTint(color: string, pct = 14): string {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}
