import { createFlagsDiscoveryEndpoint, getProviderData } from 'flags/next'
import * as exportsDeFlags from '@/flags'

/**
 * Endpoint de descubrimiento de flags para la Toolbar de Vercel (override por
 * sesión). Protegido con FLAGS_SECRET: Vercel firma sus requests con ese
 * secreto, así nadie más puede leer la lista.
 *
 * `getProviderData` arma la lista con las declaraciones de `flags.ts`, sin
 * consultar a Vercel Flags.
 */
// `porEntorno` también se exporta (la usan los tests) y no es un flag: se deja afuera.
const flags = Object.fromEntries(Object.entries(exportsDeFlags).filter(([nombre]) => nombre !== 'porEntorno'))

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getProviderData(flags)
})
