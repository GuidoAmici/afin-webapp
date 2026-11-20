<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Entornos y ramas

Hay dos entornos: **`stg`** (base de prueba, `https://stg.afinsrl.com.ar`) y **`prod`**. No hay `dev` (ADR-0006).

- **Ramas cortas.** Cada trabajo sale de `stg` en su propia rama y vuelve a `stg` por PR. `prod` sólo recibe merges de `stg` (release, `release-prod.yml`) o de una rama `hotfix/*` (`hotfix-prod.yml`, que se despacha a mano).
- **Todo lo nuevo y visible va detrás de un flag apagado en producción** (`flags.ts`, en la raíz: flags de release con `flags/next`, valor fijo por entorno). Un cambio sin función visible (esquema, refactor, arreglo interno) no lo necesita. Los ops toggles que mueve un admin en caliente (`payments_enabled`, etc.) son otra cosa: viven en la tabla `settings` y se leen con `lib/settings.ts`.
- **Migraciones expand-only** (sólo agregan). Si el PR trae algo que no lo es (`DROP`, `UPDATE`/`DELETE` de datos, cambios de permisos o de cuerpo sobre objetos que ya existen, `setval`), **no se abre sin la aprobación de Guido.**

## Hotfix

`hotfix-prod.yml` se despacha a mano desde una rama `hotfix/*` cortada de `prod` (falla si el ref no empieza con `hotfix/`). Migra la base de prod, mergea a `prod`, despliega y hace back-merge a `stg`. Si el deploy falla, el rollback revierte sólo el código: la migración queda. **Re-despachar la misma rama tras un rollback no mergea nada y el workflow falla a propósito**: revertí el revert en `prod` o cortá una rama `hotfix/*` nueva.

## Migración de un PR cerrado sin mergear

Un PR con migración contra `stg` la aplica a la base de prueba al abrirse. Mientras está abierto, las demás ramas ven en la base de prueba una versión remota que no tienen: `migrate-stg` corre `db-push` con `DESCONOCIDAS=avisar`, que deja un `::warning::` con la lista y sigue, para no trabar los pushes a `stg` ni los otros PRs de base. En prod (`release-prod.yml`, `hotfix-prod.yml`) el modo es el default, `frenar`: una versión desconocida corta el run sin aplicar nada. El guard de colisión (misma versión, otro nombre) frena siempre.

Si el PR se cierra sin mergear, la migración queda aplicada en la base de prueba y el `::warning::` sigue apareciendo en cada run. Se limpia a mano, **sólo en la base de prueba, nunca en prod**: borrá los objetos que creó (tablas, funciones, columnas) y borrá su fila de `supabase_migrations.schema_migrations`.

## MIGRACIONES_EXTERNAS

Variable de repo (`vars.MIGRACIONES_EXTERNAS`) con las versiones de migración que existen en la base remota y no en `supabase/migrations/`. `scripts/db-push.mjs` frena si encuentra una versión remota desconocida, salvo que esté en esta lista.

Hoy tiene 5 versiones de prod: `20260611155800`, `20260611163152`, `20260611170315`, `20260611172251`, `20260611181537`. Son migraciones de junio de 2026 que se aplicaron a prod con un timestamp distinto al de su archivo en el repo: el objeto existe, la versión no coincide. La lista sólo evita que `db-push` frene por esas filas; **no hace que se salteen los archivos**.

**El primer release re-corre esos 5 archivos en prod**: `20260610000000_create_profiles`, `20260611000000_create_orders`, `20260611100000_add_tipo_facturacion`, `20260611200000_fix_rls_recursion` y `20260611210000_order_update_policies`. Sus versiones no están en el historial de prod (las filas tienen las versiones de arriba), así que `db-push` los ve pendientes. Son idempotentes —`IF NOT EXISTS`, `DROP … IF EXISTS` antes de cada `CREATE TRIGGER`/`CREATE POLICY`, `CREATE OR REPLACE FUNCTION`—: no fallan sobre objetos que ya existen. Sí reescriben políticas y funciones con su versión de junio; las migraciones posteriores (`20260612000000` en adelante) van detrás en el mismo run, en orden de versión, y las dejan como en el repo. Cada archivo es su propia transacción: si el run corta a mitad, prod puede quedar con políticas de junio hasta que se re-despache el release, que retoma desde el archivo que falló.

**Agregar una versión a la lista necesita el OK de Guido.** Es la forma de decirle al script «esto es esperado»; un agente no la usa para destrabar un push.

## `register_transfer_payment(uuid,text)`

Existe en la base de prueba **sin migración**: viene de una rama local, `feat/15-pago-transferencia`. **Nunca llega a prod.** Quien retome esa rama escribe su migración, o la borra de la base de prueba.

# Convención de Pull Requests

Todo PR **debe** cerrar su descripción con dos bloques. La regla que los separa:

> **Si una máquina puede verificarlo, la máquina lo verifica.** Al humano sólo le queda lo que requiere criterio.

## 1 · Verificado automáticamente

Qué se probó y **con qué resultado concreto** — no "se corrieron los tests", sino el número, el comando o la respuesta. Va todo lo comprobable sin ojos: rutas que responden 200, flags en sus dos estados, textos presentes en el HTML renderizado, tipos, lint, build, E2E.

Si dudás de si un ítem va acá o abajo: **intentá verificarlo primero**. Un `curl` a la ruta con el flag forzado tarda menos que escribir la instrucción para que lo haga otro.

## 2 · Sólo vos

Lo que **no** se puede automatizar: copy, tono, jerarquía visual, si una decisión de marca se siente bien, si el orden de una página tiene sentido para quien la lee.

Cada ítem lleva **el link directo**, ya con los query params o el estado que haga falta — no las instrucciones para llegar. El humano hace clic y mira, no navega ni configura. **El link apunta a stg** (`https://stg.afinsrl.com.ar/…`), no al preview del PR: el operador no prueba PR por PR, prueba stg con todo junto (ver abajo).

```md
## Sólo vos
- [ ] [El copy del catálogo](https://stg.afinsrl.com.ar/productos) — ¿se entiende sin explicación?
- [ ] [Jerarquía del hero](https://stg.afinsrl.com.ar/) en teléfono
```

**Sólo vos no es para decisiones.** Una decisión de negocio se resuelve **antes** de abrir el PR: quien la necesita se la pasa al Chief of Staff, que la junta con las demás y vuelve con la respuesta. Un PR se abre cuando ya no espera ninguna decisión del operador.

**Si el PR trae migraciones**, decirlo arriba: no sale a producción solo (ver `release-prod.yml`).

**Un PR con migración contra `stg` la aplica a la base de stg al abrirse**, no al mergear: el job `migrate-stg` de `stg-ci.yml` corre también en `pull_request`, para que el preview vea el schema del PR. Por eso la migración tiene que ser expand-only (sólo agrega). Mientras el PR está abierto, `db-push` sólo avisa de esa versión en los demás runs; si el PR se cierra sin mergear, su tabla o función queda en stg y se limpia a mano (ver arriba).

# Merge a stg: lo hace el agente, sin esperar al operador

**El agente que abrió el PR lo mergea a `stg`** cuando se cumplen **todos** estos gates. No hace falta la revisión del operador.

1. **CI completo en verde** sobre el último commit: lint, tipos, tests, build, pgTAP, E2E, Playwright y migraciones a stg.
   - **Los E2E en `success`, salvo que `cambios` clasifique el PR como sólo docs.** `stg-ci.yml` corre en cada `pull_request` (tipos por defecto, sin condición de draft) y el job `cambios` clasifica el diff. No alcanza con que `gh pr checks` dé verde: GitHub muestra un job salteado como verde, así que mirá que los E2E hayan corrido (`success`) sobre el último commit.
   - **PR de sólo docs.** Si todos los archivos del diff caen en `^([^/]+\.md|docs/.*|\.claude/.*)$` (la clasificación de `cambios`), los jobs de código quedan `skipped` y eso es lo **esperado**: el gate se da por cumplido con `cambios` en verde.
2. **Revisión de código hecha por otro agente** (`/code-review` o un subagente revisor) sobre el diff final, **sin hallazgos abiertos**. Se deja constancia en un comentario del PR.
3. **Lo nuevo y visible va detrás de un flag apagado en producción** (`flags.ts`, en la raíz). Un cambio sin función visible no lo necesita. Si un spec de `tests/` usa la feature, arranca con `requiereFlag(<flag>)` (`tests/flags-del-entorno.ts`): el E2E del hotfix corre con los flags de producción y ahí ese paso se saltea.
4. **Migraciones expand-only.** Si el PR trae algo que no lo es (`DROP`, `UPDATE`/`DELETE` de datos, cambios de permisos o de cuerpo sobre objetos que ya existen, `setval`), **no se abre sin la aprobación de Guido**, pedida por el Chief of Staff.
5. **Ninguna decisión de negocio pendiente** (ver arriba).

Si un gate no se cumple, el PR espera y el agente avisa al Chief of Staff qué falta. El merge es con `--match-head-commit` sobre el SHA que se revisó.

**Qué prueba el operador y cuándo.** Al mergear, los ítems de *Sólo vos* pasan solos al issue fijado **«Para probar en stg»** (workflow `para-probar-stg.yml`). El operador lo recorre cuando quiere —por ejemplo, antes de un release— y tilda lo que le cierra.
