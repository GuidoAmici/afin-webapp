/**
 * Parser de los valores de texto de los ops flags (`lib/settings.ts`).
 *
 * Los flags de release ya no viven acá: están en `flags.ts` (raíz), con
 * `flags/next` y valor fijo por entorno.
 */

/** Interpreta un valor de texto de flag. Vacío o desconocido → `fallback`. */
export function parseFlag(raw: string | undefined, fallback: boolean): boolean {
  if (raw == null || raw.trim() === '') return fallback
  const value = raw.trim().toLowerCase()
  if (value === '1' || value === 'true' || value === 'on') return true
  if (value === '0' || value === 'false' || value === 'off') return false
  return fallback
}
