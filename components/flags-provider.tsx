'use client'

import { createContext, useContext } from 'react'

// Puente de feature flags server → client. Los flags se evalúan en el server
// (root layout, ver flags.ts) y se inyectan acá para que los client components
// puedan leerlos sin volver a evaluarlos. Son UI: la puerta real de cada feature
// vive en el servidor (route handler o `notFound()`).
//
// Default fail-closed: si el provider no envuelve al componente (p. ej. en un
// test que monta un componente aislado) todo queda apagado, como en production.

export type ClientFlags = {
  pedidos: boolean
  checkoutMp: boolean
  registroClientes: boolean
  newsletter: boolean
  panelProductos: boolean
  panelClientes: boolean
  zonaInternos: boolean
}

const DEFAULT_FLAGS: ClientFlags = {
  pedidos: false,
  checkoutMp: false,
  registroClientes: false,
  newsletter: false,
  panelProductos: false,
  panelClientes: false,
  zonaInternos: false,
}

const FlagsContext = createContext<ClientFlags>(DEFAULT_FLAGS)

export function FlagsProvider({
  value,
  children,
}: {
  value: ClientFlags
  children: React.ReactNode
}) {
  return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>
}

export function useFlags(): ClientFlags {
  return useContext(FlagsContext)
}
