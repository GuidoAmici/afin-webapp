/**
 * Cuánto hace que algo espera, en castellano y en la unidad que le sirve a quien
 * mira una cola: minutos hasta la hora, horas hasta el día, después días.
 *
 * En una cola operativa el dato útil no es la fecha sino la espera acumulada —
 * "hace 3 días" pesa distinto que "12/06/2026 14:32".
 */
export function elapsedLabel(iso: string, now: Date = new Date()): string {
  const ms = now.getTime() - new Date(iso).getTime()
  if (!Number.isFinite(ms)) return ''

  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return 'recién'
  if (minutes < 60) return `hace ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`

  const days = Math.floor(hours / 24)
  return days === 1 ? 'hace 1 día' : `hace ${days} días`
}

/** Días completos esperando. Sirve para marcar una espera como excesiva. */
export function elapsedDays(iso: string, now: Date = new Date()): number {
  const ms = now.getTime() - new Date(iso).getTime()
  if (!Number.isFinite(ms) || ms < 0) return 0
  return Math.floor(ms / 86_400_000)
}
