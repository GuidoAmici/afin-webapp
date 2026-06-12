import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cliente anónimo sin cookies para datos públicos (catálogo).
// Al no leer cookies(), las páginas que lo usan pueden renderizarse
// estáticamente y cachearse con `revalidate` (ISR).
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } }
  )
}
