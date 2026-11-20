import { flag } from 'flags/next'

/**
 * Flags de release de afin-webapp (ADR-0005, revisado: ya no son env vars).
 *
 * Valor fijo por entorno, declarado en este archivo y evaluado en el servidor:
 *   - production: el valor de `produccion` de cada flag (todo lo nuevo y visible
 *     llega a producción apagado).
 *   - preview (stg) y desarrollo: todos encendidos.
 *
 * Cambiar un valor es un commit y un deploy. El override por sesión desde la
 * Toolbar de Vercel lo aplica el SDK con su cookie, sin pasar por ningún proveedor.
 *
 * Los server components y las route handlers hacen `await <flag>()`; los client
 * components leen el valor ya evaluado con `useFlags()` (`components/flags-provider.tsx`,
 * alimentado desde `app/layout.tsx`).
 *
 * Los ops flags (`payments_enabled`, etc.) son otra cosa: viven en la tabla
 * `settings` y los mueve un admin en caliente. Ver `lib/settings.ts`.
 */

/** El valor de un flag en el entorno actual: `produccion` en production, encendido en el resto. */
export function porEntorno(produccion: boolean) {
  return () => (process.env.VERCEL_ENV === 'production' ? produccion : true)
}

const enabledDisabled = [
  { value: true, label: 'Enabled' },
  { value: false, label: 'Disabled' },
]

/**
 * Canal de pedidos por el sitio: carrito, «Agregar al pedido», `POST /api/orders`
 * y el historial de `/cuenta/pedidos`. Apagado, el catálogo deriva a WhatsApp y
 * la fábrica sigue tomando pedidos por el canal de siempre. `/empleados` no
 * depende de este flag: el personal necesita la cola igual.
 */
export const pedidosFlag = flag<boolean>({
  key: 'pedidos',
  decide: porEntorno(false),
  defaultValue: false,
  description: 'Canal de pedidos por el sitio (carrito, /api/orders, /cuenta/pedidos). Apagado: el catálogo deriva a WhatsApp.',
  options: enabledDisabled,
})

/**
 * Pago online con Mercado Pago: botón de pago y `POST /api/checkout/mp`. El
 * webhook `/api/webhooks/mp` NO depende de este flag: un pago ya iniciado tiene
 * que poder confirmarse aunque se corte el checkout.
 */
export const checkoutMpFlag = flag<boolean>({
  key: 'checkout-mp',
  decide: porEntorno(false),
  defaultValue: false,
  description: 'Pago online con Mercado Pago (botón y /api/checkout/mp). Apagado: 404 en el endpoint.',
  options: enabledDisabled,
})

/** Alta de cuentas de clientes: `/auth/registro` y la vista de registro del modal de login. */
export const registroClientesFlag = flag<boolean>({
  key: 'registro-clientes',
  decide: porEntorno(false),
  defaultValue: false,
  description: 'Registro de clientes (/auth/registro y el link de registro del login). Apagado: 404.',
  options: enabledDisabled,
})

/** Suscripción al newsletter: el formulario (footer y blog) y la action que lo recibe. */
export const newsletterFlag = flag<boolean>({
  key: 'newsletter',
  decide: porEntorno(false),
  defaultValue: false,
  description: 'Suscripción al newsletter (formulario y action). Apagado: no se muestra y la action devuelve error.',
  options: enabledDisabled,
})

/** Panel `/empleados`: administración de catálogo, precios y stock (#18). */
export const panelProductosFlag = flag<boolean>({
  key: 'panel-productos',
  decide: porEntorno(false),
  defaultValue: false,
  description: 'Panel /empleados: sección Productos (#18). Apagado: no aparece en el nav.',
  options: enabledDisabled,
})

/** Panel `/empleados`: ficha de clientes. */
export const panelClientesFlag = flag<boolean>({
  key: 'panel-clientes',
  decide: porEntorno(false),
  defaultValue: false,
  description: 'Panel /empleados: sección Clientes. Apagado: no aparece en el nav.',
  options: enabledDisabled,
})

/** Zona de internos. Todavía sin consumidores: la usa un plan posterior. */
export const zonaInternosFlag = flag<boolean>({
  key: 'zona-internos',
  decide: porEntorno(false),
  defaultValue: false,
  description: 'Zona de internos. Apagado por defecto en production.',
  options: enabledDisabled,
})
