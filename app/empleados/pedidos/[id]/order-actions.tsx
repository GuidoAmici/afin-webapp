'use client'

import { useState, useTransition } from 'react'
import { transitionOrderAction } from './actions'
import type { Axis } from '@/lib/order-transitions'

export interface ActionButton {
  axis: Axis
  to: string
  label: string
  color: string
  /** Transición admin-only (nivel 2): se pinta como "forzar". */
  force: boolean
  /** Bloqueada por barrera cross-eje (ej. preparar sin pago); se deshabilita. */
  blocked?: boolean
  blockedReason?: string
}

export function OrderActions({
  orderId,
  statusActions,
  paymentActions,
}: {
  orderId: string
  statusActions: ActionButton[]
  paymentActions: ActionButton[]
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')

  function run(axis: Axis, to: string) {
    setError(null)
    startTransition(async () => {
      const res = await transitionOrderAction({ orderId, axis, to, motivo })
      if (res.error) setError(res.error)
      else setMotivo('')
    })
  }

  const hasStatus = statusActions.length > 0
  const hasPayment = paymentActions.length > 0

  if (!hasStatus && !hasPayment) {
    return (
      <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>
        No hay acciones disponibles para tu rol desde el estado actual.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {hasStatus && (
        <Group title="Estado del pedido" actions={statusActions} pending={pending} onRun={run} />
      )}
      {hasPayment && (
        <Group title="Pago" actions={paymentActions} pending={pending} onRun={run} />
      )}

      <div>
        <label htmlFor="motivo" style={{ display: 'block', fontSize: 12, color: 'var(--fg-3)', marginBottom: 4 }}>
          Motivo (opcional — queda en el historial)
        </label>
        <input
          id="motivo"
          type="text"
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          placeholder="Ej.: comprobante no coincide con el monto"
          disabled={pending}
          style={{
            width: '100%', fontSize: 13, padding: '8px 10px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)', color: 'var(--fg-1)',
          }}
        />
      </div>

      {error && (
        <p style={{ fontSize: 13, color: 'var(--error-500)', margin: 0 }}>{error}</p>
      )}
    </div>
  )
}

function Group({
  title,
  actions,
  pending,
  onRun,
}: {
  title: string
  actions: ActionButton[]
  pending: boolean
  onRun: (axis: Axis, to: string) => void
}) {
  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 8 }}>{title}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {actions.map(a => {
          const disabled = pending || a.blocked
          return (
            <button
              key={`${a.axis}:${a.to}`}
              type="button"
              onClick={() => onRun(a.axis, a.to)}
              disabled={disabled}
              title={a.blocked ? a.blockedReason : a.force ? 'Acción de admin (forzar)' : undefined}
              style={{
                fontSize: 13, fontWeight: 600, padding: '8px 14px',
                borderRadius: 'var(--radius-md)', cursor: disabled ? 'not-allowed' : 'pointer',
                border: `1px solid ${a.force ? 'var(--error-500)' : a.color}`,
                color: a.force ? 'var(--error-500)' : a.color,
                background: 'var(--bg-card)',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {a.force ? '⚠ ' : ''}{a.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
