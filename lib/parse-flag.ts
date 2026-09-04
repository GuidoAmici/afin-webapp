/** Interpreta el JSONB/texto guardado en `settings` para los ops flags (ver lib/settings.ts). */
export function parseFlag(raw: string | undefined, fallback: boolean): boolean {
  if (raw == null || raw.trim() === '') return fallback
  const value = raw.trim().toLowerCase()
  if (value === '1' || value === 'true' || value === 'on') return true
  if (value === '0' || value === 'false' || value === 'off') return false
  return fallback
}
