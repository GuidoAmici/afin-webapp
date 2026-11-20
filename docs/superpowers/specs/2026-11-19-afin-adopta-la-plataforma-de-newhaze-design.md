# AFIN adopta la plataforma de New Haze

Fecha: 2026-11-19 · Estado: borrador para aprobar · Relacionado: GuidoAmici/my-awi-user#24,
`afin-intern-panel/docs/superpowers/specs/2026-11-18-comprobantes-arca-en-supabase-design.md`

## Para qué

`afin-webapp` y `newhaze-webapp` resuelven los mismos problemas de plataforma (ramas,
entornos, CI, release, flags, permisos y configuración de Auth), pero cada uno por su
lado. New Haze lo trabajó mucho más: tiene 30 ADR contra 5. AFIN lleva meses parado y
hoy no se puede pasar a prod sin riesgo (ver la revisión del 2026-11-19 en el diseño de
ARCA).

Guido decidió que **AFIN copia la plataforma de New Haze**. Lo que New Haze ya resolvió
se copia; lo que AFIN hace mejor se conserva y se le propone a New Haze. Este diseño
define qué se copia, qué se conserva y en qué orden. Es el requisito previo del trabajo
de ARCA y del pase a prod.

## Las reglas que se adoptan

1. **Dos entornos: `stg` y `prod`.** No hay `dev`. Cada cambio es una rama corta
   (`feat/…`, `fix/…`, `docs/…`) que entra a `stg` por PR, y GitHub la borra al
   mergear. `stg` usa la base de test (`wbsvxdquzvsawmjoiwat`) y stg.afinsrl.com.ar;
   `prod` usa la base de prod y afinsrl.com.ar.
2. **Todo lo nuevo y visible llega a prod detrás de un flag apagado** (ADR-0029 de New
   Haze). Se prende cuando se probó en prod. Subir código y prender una función son dos
   actos distintos.
3. **Las migraciones de un PR son expand-only** (ADR-0017): se aplican a stg al abrir el
   PR, mientras stg todavía corre el código anterior. La contracción (`drop`, `rename`)
   va en un PR posterior.
4. **La frontera es la base:** RLS y funciones con permiso (ADR-0001 y ADR-0030). Un flag
   o una pantalla nunca son control de acceso.
5. **La configuración vive en el repo:** Auth en `supabase/config.toml` (ADR-0020), y los
   flags en el código.
6. **El agente mergea a `stg`** cuando se cumplen los gates de `AGENTS.md` de New Haze:
   CI verde, revisión por otro agente sin hallazgos, flag apagado en prod, migración
   expand-only y ninguna decisión de negocio pendiente. El operador prueba stg cuando
   quiere, desde el issue fijado «Para probar en stg».

## Comparación de CI

Lo medí leyendo los workflows en `origin/stg` de los dos repos.

| Tema | AFIN hoy | New Haze | Qué se hace |
|---|---|---|---|
| Disparo | Solo `push` a `dev`: un PR no corre ningún check | `pull_request` y `push` a `stg` | **NH** |
| Qué corre | Lint, pgTAP, migración a test, preview y Playwright | Además detecta qué cambió (código o base) y corre solo eso; typecheck; e2e local para los flujos que escriben (ADR-0021) | **NH** |
| Tipos de la base | `gen-types:check` contra el stack local, sin gate en CI | Se generan contra el stack local del job pgTAP y se comparan (ADR-0016) | **NH** |
| Actions | Tags móviles (`@v4`) | Fijadas por SHA (ADR-0016), con `check-workflow-permissions.mjs` | **NH** |
| De la rama a `stg` | Merge automático `dev → stg` con `-X theirs`: pisa conflictos en silencio | PR a `stg`, y la rama se borra al mergear | **NH** |
| Migración en stg | Después del merge | En el PR, antes del merge, con contrato expand-only (ADR-0017) | **NH** |
| Release | Al mergear el PR de release-please; promueve **el build de Preview** al apex | `workflow_call` desde `stg-ci`. El gate falla cerrado si hay migraciones y, si no, sale solo. Construye para Production desde `prod` (`vercel build --prod`) | **NH**. Corrige el bloqueante 1 y el de www |
| Versionado | release-please con PR manual | release-please con auto-merge, desacoplado de prod (ADR-0007) | **NH** |
| Hotfix | E2E con las variables de prod, verifica que el deployment esté `READY` y **revierte el merge si el deploy falla** | Sin E2E y sin rollback, pero aplica migraciones y hace back-merge a `stg` | **AFIN más NH**: se conserva el E2E y el rollback de AFIN, se suman las migraciones de NH y el back-merge pasa a `stg` |
| Después del merge | Nada | Los ítems de «Sólo vos» pasan solos al issue «Para probar en stg» | **NH** |
| Monitoreo | Nada | Smoke diario de rutas impresas | No aplica a AFIN por ahora |

**Veredicto:** New Haze está más trabajado en casi todo, y sobre todo en lo que hoy
bloquea a AFIN: el disparo por PR, la migración pre-merge y el build de Production. AFIN
gana en el hotfix: el rollback automático y el E2E contra prod no existen en New Haze.

### Lo que New Haze decidió pero todavía no construyó

El ADR-0029 de New Haze (aceptado el 2026-10-11) define el release programado con lint
expand-only por AST, la aprobación por hash y el backup local cifrado con `age`.
**Ninguna de esas tres cosas existe en sus workflows todavía:** `release-prod.yml` no
tiene `schedule` ni lint ni chequeo de backup, y `scripts/` no tiene el lint. AFIN copia
lo que New Haze tiene andando. El resto lo copia cuando New Haze lo construya, y no lo
construye por su cuenta: así no quedan dos versiones de lo mismo.

## Qué se copia, de dónde

| Pieza | Fuente en New Haze | Qué cambia en AFIN |
|---|---|---|
| `stg-ci.yml` | `.github/workflows/stg-ci.yml` | Reemplaza a `dev-ci.yml`. Base de PR #48, que ya hace parte de esto |
| `release-prod.yml` | ídem | Gate fail-closed, build de Production desde `prod`. `vercel deploy --prod` aplica todos los dominios de Production, así que www también se mueve |
| `hotfix-prod.yml` | ídem, más lo de AFIN | Ver la tabla: E2E y rollback de AFIN, migraciones y back-merge a `stg` de NH |
| `para-probar-stg.yml` | ídem | Igual |
| `scripts/db-push.mjs`, `db-types.mjs`, `check-workflow-permissions.mjs`, `supabase-guard.mjs` | `scripts/` | `db-push` tiene que detectar las versiones remotas sin archivo (hoy hay 5 en prod) |
| Flags | `src/flags.ts` (`flags/next`, valor fijo por entorno: el de `produccion` en Production y encendido en el resto, override por sesión desde la Toolbar de Vercel) | Reemplaza a `NEXT_PUBLIC_FF_*`. Se evalúan en el server, así que ya no viajan inlineados al browser |
| Permisos | ADR-0030 y migraciones `permisos_m1`/`m2`/`m3` | Recortado a lo que AFIN usa. Detalle en el diseño de ARCA |
| `profiles` self-only | ADR-0015 | Hoy `empleado` lee todos los perfiles. Pasa a `usuarios:ver` |
| Config de Auth | ADR-0020: `config.toml` con `env()` por entorno y templates de mail como archivos | Resuelve lo que la revisión no pudo medir (`site_url`, redirect URLs, largo de contraseña). Las cuentas `@test.com` no dependen del largo mínimo: el login no lo valida, solo el alta y el cambio de contraseña |
| Convenciones | `AGENTS.md`: formato del PR, gates para mergear a `stg`, «Para probar en stg» | Se copian a `AGENTS.md` de AFIN |
| Settings del repo | `delete_branch_on_merge: true`, rama por defecto `stg` | AFIN hoy tiene `delete_branch_on_merge: false` |

### Lo que AFIN conserva y le propone a New Haze

- **Hotfix con E2E contra prod y rollback automático** (AFIN ADR-0004, sin la parte de
  `dev`).
- **Dos tipos de flag** (AFIN ADR-0005). Los *release toggles* responden «¿existe la
  función acá?» y viven en el código. Los *ops toggles* responden «¿está operando
  ahora?»: viven en `settings`, los mueve un admin sin deploy y sirven, por ejemplo, para
  cortar cobros un sábado a la noche. New Haze tiene solo los primeros. En AFIN, mover
  un ops toggle pasa a pedir el permiso `configuracion:editar`.
- **La regla de que el flag no es la puerta:** toda función que toca datos o dinero se
  cierra también en el server. New Haze la cumple, pero no la tiene escrita.

### Lo que no se copia

Los ADR de dominio de New Haze (organizaciones, revendedores, curso, QR, recetas,
etcétera) no aplican a AFIN. Lo que hace falta de ese lado se trae cuando converjan los
paneles (#24).

## Flags de AFIN en prod después del pase

Por la regla 2, al salir a prod todo lo público nuevo queda apagado:

| Flag | Prod | Por qué |
|---|---|---|
| `pedidos` (carrito y `/cuenta/pedidos`) | apagado | Hoy está **encendido por defecto**. Sin CallMeBot nadie se entera de un pedido |
| `checkout-mp` | apagado | Tiene los dos riesgos de Mercado Pago que encontró la revisión |
| `registro-clientes` | apagado | Sin SMTP propio no llega el mail de confirmación |
| `newsletter` | apagado | Brevo no está configurado en ningún entorno |
| `zona-internos` | encendido | Es lo que Andrés tiene que ver. Lo protegen el guard y la RLS |

Con esos flags apagados, CallMeBot, Mercado Pago, Brevo y SMTP **dejan de bloquear el
pase**. Se configuran cuando se prenda cada flag.

## Orden

1. **Plataforma en `afin-webapp`**, en PRs a `stg`:
   1. Back-merge de `origin/prod` en `stg` (en el conflicto de `app/(public)/page.tsx`
      se conserva la versión de `stg`) y borrado de `dev` y de las ramas obsoletas.
   2. CI y release copiados de New Haze (sobre PR #48), con el hotfix combinado y
      `delete_branch_on_merge`.
   3. Flags con `flags/next`, configuración de Auth en el repo y convenciones en
      `AGENTS.md`.
2. **Permisos, ARCA y panel**, según el diseño de ARCA, con cada pantalla detrás de su
   flag.
3. **Pase a prod**, como último paso de la sesión: lo público nuevo apagado y el panel
   encendido para el equipo.
4. **Andrés revisa el sistema en prod.** Recién después se pulen los detalles de
   producción: precios, SMTP, CallMeBot, Mercado Pago y prender flags.

## Lo que queda al constructor

- Cómo se parte cada PR del paso 1, mientras ninguno dependa de una decisión pendiente.
- Los nombres exactos de los flags.
- Si `para-probar-stg.yml` y el issue fijado se crean ahora o cuando haya algo para probar.
