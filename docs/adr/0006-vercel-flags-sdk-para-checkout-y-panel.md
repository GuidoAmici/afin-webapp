# Vercel Flags SDK para checkout y panel — `pedidos` se queda en env var

Se agregó Vercel Web Analytics y se evaluó llevar los 4 flags de release de ADR-0005 (`pedidos`, `checkoutMp`, `panelProductos`, `panelClientes`) al Flags SDK de Vercel (`flags` + `@flags-sdk/vercel`), para poder togglearlos desde el dashboard sin redeploy — la limitación que ADR-0005 aceptaba a propósito.

Migrar los 4 de una implica evaluarlos en runtime, server-side, en cada request. `checkoutMp`, `panelProductos` y `panelClientes` ya vivían en contextos que eran dinámicos de por sí (`app/api/checkout/mp/route.ts`, `app/api/orders/route.ts`, `app/empleados/layout.tsx`), así que migrarlos no cambia nada del perfil de cacheo del sitio. `pedidos` es distinto: se lee en `Header` y `AccountButton`, presentes en todas las páginas vía `app/layout.tsx`. Migrarlo junto con los otros tres se probó primero y el build lo confirmó: `/`, `/productos`, `/blog`, `/cuenta`, `/contacto` y `/auth/*` — hoy `○` estáticas con ISR de 5 minutos — pasaban todas a `ƒ` (server-rendered por request), porque cualquier componente que dependa de un flag evaluado en runtime en un ancestro común fuerza a ese ancestro (acá, `RootLayout`) a renderizar dinámico.

## Decisión

Se migran al SDK **solo** `checkoutMp`, `panelProductos` y `panelClientes`, en `lib/flags.ts`. `pedidos` se queda como estaba en ADR-0005 — env var `NEXT_PUBLIC_FF_PEDIDOS`, inlineada en build — ahora en `lib/pedidos-flag.ts` (se separó del resto porque `lib/flags.ts` le pasa el módulo entero a `getProviderData()` del discovery endpoint, que rechaza cualquier export que no sea un `flag()`).

`checkoutMp` necesitaba llegar a un componente cliente (`CartModal`, en la vista "confirmado", para mostrar o no el botón de pago). En vez de un provider global en `RootLayout` — que hubiera reintroducido el mismo problema de ISR que con `pedidos`, porque `CartModal` cuelga del mismo árbol — el valor viaja en la respuesta JSON de `POST /api/orders`, que ya es el round-trip que dispara esa vista. Server-side, la puerta real sigue siendo el `checkoutMp` evaluado directamente en `app/api/checkout/mp/route.ts`.

Se agregó el discovery endpoint (`app/.well-known/vercel/flags/route.ts`) para que Flags Explorer vea los 3 flags migrados, autenticado con `FLAGS_SECRET`.

## Considered Options

**Migrar los 4 al SDK, sitio 100% dinámico:** descartado — el catálogo público es la superficie de mayor tráfico del sitio; perder ISR ahí para ganar un toggle sin redeploy en un flag que ya funciona (`pedidos` viene apagándose por redeploy sin incidentes) no vale el costo de infraestructura.

**Middleware + `precompute` (patrón oficial del SDK para preservar estático con flags):** evalúa el flag en middleware y genera una variante estática por combinación de flags vía `generateStaticParams`. Se descartó por alcance: el patrón está pensado para un flag en una página puntual, no para uno que determina el render de un componente de nav global presente en rutas anidadas con segmentos dinámicos (`/productos`, `/empleados/pedidos/[id]`). Adoptarlo hoy implica meter el segmento `[flags]` en todo el árbol de rutas — una reestructuración de ruteo desproporcionada para un flag.

**Partial Prerendering (Suspense boundary alrededor del Header):** preserva el shell estático y solo la franja del nav se resuelve en runtime. Se descartó por dos motivos: soporte de PPR con Turbopack en Next.js 16 sin validar en este stack, y requiere partir `Header` en server + client component con un fallback visual — más superficie de cambio que el problema justifica hoy. Queda como opción si en algún momento `pedidos` necesita moverse sin redeploy.

## Consequences

- Conviven tres mecanismos de flags, cada uno con un rol distinto:

  | | `pedidos` | `checkoutMp` / `panelProductos` / `panelClientes` | ops flags (`payments_enabled`, …) |
  |---|---|---|---|
  | Vive en | `lib/pedidos-flag.ts`, env var | `lib/flags.ts`, Vercel Flags SDK | `settings`, `lib/settings.ts` |
  | Lo mueve | quien deploya | cualquiera con acceso al dashboard de Vercel | un admin, desde el panel |
  | Efecto | requiere redeploy | inmediato | inmediato |
  | Por qué acá | vive en un componente cliente global; runtime rompería ISR | ya vivían en contextos dinámicos; ganan toggle sin redeploy gratis | perilla operativa, no de release |

- Cada flag del SDK necesita **promoverse desde draft** en el dashboard de Vercel (Project → Flags) antes de que el valor mostrado ahí sea el que decide algo — hasta entonces corre con el `defaultValue` del código, igual que hoy.
- `FLAGS_SECRET` es nuevo por entorno (development / preview / production) — sin él, el discovery endpoint no autentica y Flags Explorer no ve los flags. Se genera una vez por entorno (`node -e "console.log(crypto.randomBytes(32).toString('base64url'))"`) y se carga en Vercel, no en git.
- Si algún día `pedidos` necesita un kill switch sin redeploy, la opción documentada es Partial Prerendering (descartada arriba, no por invalidez sino por desproporción hoy).
- `parseFlag` se separó a `lib/parse-flag.ts` — antes vivía en `lib/flags.ts` junto a los flags de env var; ahora ese archivo es exclusivamente flags del SDK (lo exige `getProviderData`) y `parseFlag` lo siguen usando `lib/pedidos-flag.ts` y `lib/settings.ts` (ops flags).
