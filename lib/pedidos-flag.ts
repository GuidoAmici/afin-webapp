import { parseFlag } from './parse-flag'

/**
 * Canal de pedidos por el sitio: carrito, "Agregar al pedido", `POST /api/orders`
 * y el historial de `/cuenta/pedidos`. Apagado, el catálogo deriva a WhatsApp y
 * la fábrica sigue tomando pedidos por el canal de siempre.
 *
 * Sigue siendo env var — no vive en `lib/flags.ts` con el resto de los flags de
 * release — porque se lee en el Header y el AccountButton, presentes en todas
 * las páginas del sitio público. Evaluarlo en runtime (como los flags del SDK)
 * forzaría a `/`, `/productos`, `/blog` y `/contacto` a perder ISR y
 * renderizarse en cada request (ver ADR-0006). `NEXT_PUBLIC_FF_PEDIDOS` se
 * inlinea en el build: cambiar este flag exige redeploy, igual que en ADR-0005.
 *
 * Default `true`: la feature ya está en producción; el flag existe para poder
 * apagarla, no para habilitarla.
 */
export const pedidos = parseFlag(process.env.NEXT_PUBLIC_FF_PEDIDOS, true)
