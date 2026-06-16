// Fuente de verdad única del eje de pago de un pedido (ADR-005), gemelo de
// order-status.ts. Alineado con el CHECK de orders.payment_status (fase 2):
//   pendiente · en_revision · pagado
//
// Igual que el eje logístico, lo consumen tanto el panel del cliente como el
// de empleados, así el vocabulario y los colores quedan consistentes. Los
// colores son tokens del design system (globals.css) — nunca hex crudos — para
// que el modo oscuro funcione solo. Para fondos tinteados reusar statusTint()
// de order-status.ts (es genérico sobre cualquier color del DS).

export type PaymentStatus = 'pendiente' | 'en_revision' | 'pagado'

interface PaymentMeta {
  /** Etiqueta visible al usuario. */
  label: string
  /** Token de color del design system (var(--…)). */
  color: string
}

// pagado → verde (logro); en_revision → ámbar (esperando acción); pendiente → neutro.
export const PAYMENT_STATUS: Record<PaymentStatus, PaymentMeta> = {
  pendiente:   { label: 'Pago pendiente',  color: 'var(--fg-3)'        },
  en_revision: { label: 'Pago en revisión', color: 'var(--warning-700)' },
  pagado:      { label: 'Pagado',           color: 'var(--success-700)' },
}

const FALLBACK: PaymentMeta = { label: 'Pago pendiente', color: 'var(--fg-3)' }

/** Meta de un payment_status; tolera valores fuera del enum sin romper la UI. */
export function paymentMeta(status: string): PaymentMeta {
  return PAYMENT_STATUS[status as PaymentStatus] ?? FALLBACK
}

const METHOD_LABEL: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  transferencia: 'Transferencia',
}

/** Etiqueta legible del medio de pago; null/desconocido → null (no se muestra). */
export function paymentMethodLabel(method: string | null | undefined): string | null {
  if (!method) return null
  return METHOD_LABEL[method] ?? method
}
