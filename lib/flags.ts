/**
 * Feature flags de release evaluados en runtime, vía Vercel Flags SDK
 * (`flags` + `@flags-sdk/vercel`), gestionados desde el dashboard de Vercel por
 * entorno (development / preview → stg / production). El valor se evalúa
 * server-side en cada request — no se inlinea en el build, así que **cambiar
 * un flag acá no exige redeploy** (ver ADR-0006).
 *
 * Solo viven acá los flags que ya se leen en un contexto server-side que era
 * dinámico de antes (route handlers, `/empleados`). `pedidos` se lee en el
 * Header/AccountButton — presentes en todas las páginas — y evaluarlo acá
 * forzaría a todo el sitio a perder ISR; por eso sigue siendo env var, en
 * `lib/pedidos-flag.ts`. No confundir los dos mecanismos por parecido de key.
 *
 * Estos son flags de **release**: deciden si la feature existe en este entorno.
 * No son control de acceso — toda puerta que toque datos o dinero se cierra
 * además del lado del servidor, en la route handler correspondiente. Para
 * perillas que Andrés tenga que mover en caliente (kill switch de pago,
 * descuentos, datos bancarios) la fuente correcta sigue siendo la tabla
 * `settings` vía `lib/settings.ts` — ver ADR-0005.
 */
import { flag } from 'flags/next'
import { vercelAdapter } from '@flags-sdk/vercel'

// Este módulo solo exporta flags: el discovery endpoint (app/.well-known/vercel/flags)
// le pasa el módulo entero a getProviderData(), que rechaza cualquier export que no
// sea un flag(). Para parsear booleanos sueltos está lib/parse-flag.ts.

/**
 * Pago online con Mercado Pago: botón de pago y `POST /api/checkout/mp`.
 *
 * Default `false` (fail-closed): las credenciales de producción de MP siguen
 * pendientes (#25). El webhook `/api/webhooks/mp` **no** depende de este flag
 * — un pago ya iniciado tiene que poder confirmarse aunque se corte el checkout.
 *
 * Solo se lee server-side (route handlers y `POST /api/orders`, que lo manda
 * en la respuesta) — nunca directo desde un componente cliente, así que no
 * arrastra el problema de ISR que tiene `pedidos`.
 */
export const checkoutMp = flag<boolean>({
  key: 'checkout-mp',
  adapter: vercelAdapter(),
  defaultValue: false,
  description: 'Pago online con Mercado Pago (botón de pago + /api/checkout/mp)',
  options: [
    { value: true, label: 'On' },
    { value: false, label: 'Off' },
  ],
})

/**
 * Panel `/empleados`: administración de catálogo, precios y stock (#18).
 *
 * Default `false`: la ruta todavía no existe. El flag es lo que hace que el
 * link del nav aparezca recién cuando la pantalla exista. `/empleados` ya era
 * una ruta dinámica y autenticada antes de este flag, así que evaluarlo acá
 * no cambia su perfil de cacheo.
 */
export const panelProductos = flag<boolean>({
  key: 'panel-productos',
  adapter: vercelAdapter(),
  defaultValue: false,
  description: 'Sección /empleados/productos del panel interno',
  options: [
    { value: true, label: 'On' },
    { value: false, label: 'Off' },
  ],
})

/** Panel `/empleados`: ficha de clientes. Default `false`, misma razón que arriba. */
export const panelClientes = flag<boolean>({
  key: 'panel-clientes',
  adapter: vercelAdapter(),
  defaultValue: false,
  description: 'Sección /empleados/clientes del panel interno',
  options: [
    { value: true, label: 'On' },
    { value: false, label: 'Off' },
  ],
})
