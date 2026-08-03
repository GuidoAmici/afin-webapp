/**
 * Feature flags del sitio.
 *
 * Fuente: variables de entorno, configuradas por entorno en Vercel
 * (development / preview → stg / production). Las `NEXT_PUBLIC_*` se inlinean en
 * el bundle durante el build: sirven para no renderizar UI, pero **no son un
 * control de acceso**. Toda puerta que toque datos o dinero se cierra además del
 * lado del servidor, en la route handler correspondiente.
 *
 * Cambiar un flag exige redeploy. Para perillas que Andrés tenga que mover en
 * caliente (kill switch de pago, descuentos, datos bancarios) la fuente correcta
 * es la tabla `settings`, no esto.
 */

/** Interpreta el valor crudo de una env var de flag. Vacío o desconocido → `fallback`. */
export function parseFlag(raw: string | undefined, fallback: boolean): boolean {
  if (raw == null || raw.trim() === '') return fallback
  const value = raw.trim().toLowerCase()
  if (value === '1' || value === 'true' || value === 'on') return true
  if (value === '0' || value === 'false' || value === 'off') return false
  return fallback
}

export const flags = {
  /**
   * Canal de pedidos por el sitio: carrito, "Agregar al pedido", `POST /api/orders`
   * y el historial de `/cuenta/pedidos`. Apagado, el catálogo deriva a WhatsApp y
   * la fábrica sigue tomando pedidos por el canal de siempre.
   *
   * Default `true`: la feature ya está en producción; el flag existe para poder
   * apagarla, no para habilitarla.
   */
  pedidos: parseFlag(process.env.NEXT_PUBLIC_FF_PEDIDOS, true),

  /**
   * Pago online con Mercado Pago: botón de pago y `POST /api/checkout/mp`.
   *
   * Default `false` (fail-closed): las credenciales de producción de MP siguen
   * pendientes (#25). El webhook `/api/webhooks/mp` **no** depende de este flag
   * — un pago ya iniciado tiene que poder confirmarse aunque se corte el checkout.
   */
  checkoutMp: parseFlag(process.env.NEXT_PUBLIC_FF_CHECKOUT_MP, false),
} as const
