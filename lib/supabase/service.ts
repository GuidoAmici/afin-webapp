import { createClient } from '@supabase/supabase-js'

// Cliente con privilegios elevados: SOLO para código server-only sin sesión de
// usuario (webhook de MP y jobs de sistema — ver ADR-008). Nunca importar desde
// el browser. Usa la secret key nueva de Supabase (sb_secret_, provista por la
// integración Supabase-Vercel).
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Supabase URL / secret key no configurados')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
