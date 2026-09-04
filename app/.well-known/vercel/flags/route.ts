import { createFlagsDiscoveryEndpoint } from 'flags/next'
import { getProviderData } from '@flags-sdk/vercel'
import * as flags from '@/lib/flags'

// Expone los flags de lib/flags.ts a Flags Explorer (dashboard de Vercel).
// Autenticado con FLAGS_SECRET — ver .env.example.
export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getProviderData(flags)
})
