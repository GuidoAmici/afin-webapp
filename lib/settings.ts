import { createClient } from '@/lib/supabase/server'
import { parseFlag } from '@/lib/parse-flag'

/**
 * Ops flags: los que mueve un admin desde la base, en caliente y sin deploy.
 *
 * Server-only — lee `settings` con el cliente del usuario, así que la RLS aplica
 * sola (ADR-004) y hay que llamarlo **después** de verificar la sesión: la policy
 * de lectura exige `auth.uid() IS NOT NULL`.
 *
 * Los flags de release están en `lib/flags.ts` (Vercel Flags SDK, ver ADR-0006).
 * Un flag de release decide si la feature existe en este entorno; un ops flag
 * decide si está operando ahora. Para que algo funcione tienen que estar los dos
 * en on.
 */

export type OpsFlagName = 'payments_enabled' | 'transfer_enabled' | 'order_expiry_enabled'

/**
 * Defaults del código. Son fail-open a propósito para `payments_enabled`: si la
 * base no contesta, no queremos cortar los cobros por un hipo de red — el
 * checkout va a fallar solo más adelante si la base está caída de verdad, y
 * ningún default puede hacer que se cobre de más.
 */
const DEFAULTS: Record<OpsFlagName, boolean> = {
  payments_enabled: true,
  transfer_enabled: false,
  order_expiry_enabled: false,
}

/** Interpreta el JSONB guardado. Acepta booleano o las formas de texto de `parseFlag`. */
export function parseOpsFlag(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return parseFlag(value, fallback)
  return fallback
}

/**
 * Estado actual de un ops flag. Sin cache, deliberado: un kill switch que tarda
 * en hacer efecto no es un kill switch. Es una query indexada por PK.
 */
export async function opsFlag(name: OpsFlagName): Promise<boolean> {
  const fallback = DEFAULTS[name]
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', name)
      .maybeSingle()

    if (error || !data) return fallback
    return parseOpsFlag(data.value, fallback)
  } catch {
    return fallback
  }
}
