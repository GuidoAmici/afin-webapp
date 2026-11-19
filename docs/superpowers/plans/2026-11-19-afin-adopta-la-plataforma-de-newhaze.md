# AFIN adopta la plataforma de New Haze — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que `afin-webapp` tenga los entornos, el CI, el release, los flags y la
configuración de Auth de `newhaze-webapp`, y quede listo para un pase a prod seguro.

**Architecture:** Se copia de `newhaze-webapp` (`origin/stg`) archivo por archivo y se
cambian solo los nombres de AFIN. Cada grupo de tareas es un PR a `stg` desde una rama
corta. Lo de AFIN que es mejor que lo de New Haze (el hotfix con rollback y los ops
toggles en `settings`) se conserva.

**Tech Stack:** GitHub Actions, Vercel CLI, Supabase CLI y Management API, Next 16,
`flags/next` 4.x, Vitest, Playwright y pgTAP.

**Spec:** `docs/superpowers/specs/2026-11-19-afin-adopta-la-plataforma-de-newhaze-design.md`
(en este repo).

**Fuente de New Haze:** `_data/organizations/newhaze/codebase/newhaze-webapp`, siempre en
`origin/stg`. Se lee con `git -C <ruta> show origin/stg:<archivo>`.

## Global Constraints

- Hay dos entornos: `stg` (base `wbsvxdquzvsawmjoiwat`, stg.afinsrl.com.ar, Vercel
  Preview) y `prod` (base `myzngskhjnrmnonrksmj`, afinsrl.com.ar y www, Vercel
  Production). La rama `dev` deja de existir.
- Cada cambio entra a `stg` por PR desde una rama corta, y la rama se borra al mergear.
- Todo lo nuevo y visible llega a prod detrás de un flag apagado.
- Las migraciones de un PR son expand-only (ADR-0017 de New Haze).
- Nunca se usa `mcp__supabase__apply_migration`. Las migraciones se crean con
  `supabase migration new`.
- El token de Supabase del CI es `secrets.AFIN_SUPABASE_ACCESS_TOKEN` (en New Haze,
  `NEWHAZE_CI_WEBAPP`).
- `vars.CI_RUNNER` no existe en AFIN: todos los jobs corren en `ubuntu-latest`. La
  expresión de New Haze se copia igual, porque sin la variable cae en `ubuntu-latest`.
- AFIN no tiene stg privado: lo de `STG_BYPASS_SECRET` y `puedo_entrar_stg` no se copia.
- Las Actions van fijadas por SHA completo, con el tag como comentario (ADR-0016).
- No se commitean datos reales, secretos ni valores de variables.
- Los mensajes de commit siguen Conventional Commits con scope (`ci(afin): …`) y
  terminan con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Un PR con migración se cierra sin mergear:** su objeto queda en la base de test.
   `AGENTS.md` tiene que decir cómo se limpia (Task 6).
2. **Un release con migraciones lanzado sin querer** (push a `stg`): el gate tiene que
   frenar y dejar el comando manual, nunca migrar solo (test en Task 3).
3. **Un flag apagado en prod pero llamado directo por la API:** `POST /api/orders` y
   `POST /api/checkout/mp` tienen que responder 404 con el flag apagado aunque la UI no
   muestre el botón (test en Task 7).
4. **Versiones fantasma en prod:** `db-push.mjs` tiene que frenar ante una versión remota
   sin archivo, salvo las listadas, en vez de seguir de largo (test en Task 5).
5. **El build de prod con variables de Preview:** `deploy-prod` tiene que fallar si el
   bundle referencia la base de test (verificación en Task 3).

---

## PR 1 — `chore/back-merge-prod`

### Task 1: Back-merge de `prod` en `stg`, y repo sin `dev`

**Files:**
- Modify: `app/(public)/page.tsx` (solo la resolución del conflicto)

**Interfaces:**
- Produces: `origin/stg` contiene a `origin/prod`; `git merge-tree` entre los dos ya no
  da conflictos.

- [ ] **Step 1: Medir el conflicto**

Run: `git fetch origin && git merge-tree --write-tree origin/stg origin/prod`
Expected: `CONFLICT (content): Merge conflict in app/(public)/page.tsx` y ningún otro.

- [ ] **Step 2: Mergear `origin/prod` en la rama, quedándose con `stg` en el conflicto**

Run: `git checkout -b chore/back-merge-prod origin/stg && git merge origin/prod -m "chore(afin): back-merge de prod en stg"`, después
`git checkout --ours "app/(public)/page.tsx" && git add "app/(public)/page.tsx" && git commit --no-edit`.
Verificar que el contenido del hotfix (`RUBROS`) sigue presente:
`git grep -n RUBROS -- "app/(public)/page.tsx"` tiene que encontrarlo.

- [ ] **Step 3: Verificar que el árbol no cambió salvo el merge**

Run: `git diff origin/stg --stat`
Expected: vacío o solo `app/(public)/page.tsx`. Correr `npm run lint && npm run typecheck && npm test`: todo en verde.

- [ ] **Step 4: Push y PR a `stg`**

`git push -u origin chore/back-merge-prod` y
`gh pr create --base stg --title "chore(afin): back-merge de prod en stg"`, con el cuerpo
en el formato de `AGENTS.md` de New Haze («Verificado automáticamente» / «Sólo vos»).

- [ ] **Step 5: Después del merge, verificar**

Run: `git fetch origin && git merge-tree --write-tree origin/prod origin/stg`
Expected: sin `CONFLICT`.

---

## PR 2 — `ci/alinear-con-newhaze` (PR #48, rebaseado)

### Task 2: `stg-ci.yml` copiado de New Haze

**Files:**
- Create: `.github/workflows/stg-ci.yml` (reemplaza al de PR #48)
- Delete: `.github/workflows/dev-ci.yml`
- Create: `scripts/check-workflow-permissions.mjs`, `scripts/supabase-guard.mjs` y
  `scripts/db-types.mjs`, copiados tal cual de New Haze
- Modify: `package.json`: scripts `db:types`, `db:types:check`, `db:guard` y
  `db:guard:release`, como en New Haze. `db:types:remote` usa `--project-id
  wbsvxdquzvsawmjoiwat` y escribe a `lib/database.types.ts`

**Interfaces:**
- Consumes: Task 1 mergeada.
- Produces: el job `auto-release` llama a `release-prod.yml` con `workflow_call` e
  input `automatico: true` (Task 3 define ese input).

- [ ] **Step 1: Rebasear la rama de PR #48 sobre `origin/stg`**

Run: `git fetch origin && git checkout -B ci/alinear-con-newhaze origin/ci/alinear-con-newhaze && git rebase origin/stg`.

- [ ] **Step 2: Copiar `stg-ci.yml` de New Haze con estas sustituciones, y ninguna otra**

| En New Haze | En AFIN |
|---|---|
| `rpgoixcgwynerezrxqhx` | `wbsvxdquzvsawmjoiwat` |
| `secrets.NEWHAZE_CI_WEBAPP` | `secrets.AFIN_SUPABASE_ACCESS_TOKEN` |
| `src/lib/supabase/database.types.ts` | `lib/database.types.ts` |
| `stg.newhaze.ar` | `stg.afinsrl.com.ar` |
| Cabecera y pasos de `STG_BYPASS_SECRET` | Se borran |
| Job `e2e-local` | Se deja, apuntando a la Task 4 |
| Filtros de rutas de `cambios` que mencionan `src/` | Las carpetas de AFIN: `app/`, `components/`, `lib/`, `proxy.ts`, `tests/` |

El token de GitHub App de release-please (`secrets.APP_ID`, `secrets.APP_PRIVATE_KEY`)
se conserva de PR #48, porque AFIN ya lo tiene configurado.

- [ ] **Step 3: Verificar sintaxis y permisos**

Run: `npx --yes @action-validator/cli .github/workflows/stg-ci.yml && node scripts/check-workflow-permissions.mjs`
Expected: sin errores.

- [ ] **Step 4: Verificar que ninguna Action quedó con tag móvil**

Run: `grep -nE "uses: [^ ]+@v[0-9]+\s*$" .github/workflows/*.yml`
Expected: sin salida.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows scripts package.json
git commit -m "ci(afin): stg-ci copiado de newhaze — PR y push a stg, migración pre-merge"
```

### Task 3: `release-prod.yml` con gate y build de Production

**Files:**
- Modify: `.github/workflows/release-prod.yml` (se reemplaza por el de New Haze)

**Interfaces:**
- Consumes: `scripts/db-push.mjs` (Task 5) y el input de Task 2.
- Produces: `workflow_dispatch` y `workflow_call` con input `automatico: boolean`. Con
  migraciones en `prod..stg` y `automatico: true`, el gate termina con
  `seguir=false` y deja el comando `gh workflow run release-prod.yml`.

- [ ] **Step 1: Copiar de New Haze con las sustituciones de Task 2**

Se conserva de PR #48 el paso que etiqueta `en-prod` y comenta los issues promovidos. El
job `deploy-prod` es el de New Haze (`vercel pull --environment=production`,
`vercel build --prod`, `vercel deploy --prebuilt --prod`).

- [ ] **Step 2: Agregar al final de `deploy-prod` la verificación de base**

Paso nuevo, después del deploy: baja `https://afinsrl.com.ar/` y los chunks de
`/_next/static/chunks/` que referencia, y falla si alguno contiene
`wbsvxdquzvsawmjoiwat`. Hace lo mismo con `https://www.afinsrl.com.ar/`.

- [ ] **Step 3: Probar el gate en seco**

Run: `gh workflow run release-prod.yml --ref ci/alinear-con-newhaze -f automatico=true`
sobre la rama del PR, con migraciones pendientes (hoy hay 20).
Expected: el job `gate` termina con `seguir=false`. `release` y `deploy-prod` quedan
`skipped`. En prod, `list_migrations` sigue dando 9 filas.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/release-prod.yml
git commit -m "ci(afin): release de newhaze — gate fail-closed y build de Production"
```

### Task 4: E2E local para los flujos que escriben

**Files:**
- Create: `playwright.local.config.ts`, copiado de New Haze, con `testDir: 'tests/local'`
- Create: `supabase/seed.sql`, con `cliente@test.com`, `empleado@test.com` y
  `admin@test.com` (contraseña `123`, `raw_app_meta_data.role` igual al prefijo), con el
  mismo `insert` en `auth.users` y `auth.identities` que se usó en test el 2026-11-19
- Create: `tests/local/login.spec.ts`
- Modify: `supabase/config.toml`: `[db.seed] enabled = true`, `sql_paths = ["./seed.sql"]`
- Modify: `package.json`: `test:e2e:local`, como en New Haze

- [ ] **Step 1: Escribir el test**

`tests/local/login.spec.ts`: `empleado@test.com` entra por `/auth/login` y llega a
`/empleados`; `cliente@test.com` entra y, al ir a `/empleados`, termina en `/`.

- [ ] **Step 2: Correr y ver que falla sin seed**

Run: `supabase start && npm run test:e2e:local`
Expected: FAIL (`Invalid login credentials`).

- [ ] **Step 3: Agregar el seed y la config, `supabase db reset`**

- [ ] **Step 4: Correr y ver que pasa**

Run: `npm run test:e2e:local`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add playwright.local.config.ts supabase/seed.sql supabase/config.toml tests/local package.json
git commit -m "test(afin): e2e local con usuarios de prueba sembrados"
```

### Task 5: `db-push.mjs` de New Haze, que frena ante versiones desconocidas

**Files:**
- Modify: `scripts/db-push.mjs` (se reemplaza por el de New Haze)
- Create: `scripts/db-push.test.mjs`

**Interfaces:**
- Produces: `planificar({ locales: string[], remotas: string[], externas: string[] })
  → { aplicar: string[], desconocidas: string[] }`, exportada. El CLI sale con código 1
  si `desconocidas` no está vacía. `externas` sale de la variable de entorno
  `MIGRACIONES_EXTERNAS` (lista separada por comas).

- [ ] **Step 1: Escribir los tests**

```js
test('una remota sin archivo frena', () => {
  const r = planificar({ locales: ['1_a', '2_b'], remotas: ['1_a', '9_x'], externas: [] })
  assert.deepEqual(r.desconocidas, ['9_x'])
})
test('una remota listada como externa no frena', () => {
  const r = planificar({ locales: ['1_a'], remotas: ['1_a', '9_x'], externas: ['9_x'] })
  assert.deepEqual(r.desconocidas, [])
})
test('aplica en orden las locales que faltan', () => {
  const r = planificar({ locales: ['1_a', '3_c', '2_b'], remotas: ['1_a'], externas: [] })
  assert.deepEqual(r.aplicar, ['2_b', '3_c'])
})
```

- [ ] **Step 2: Correr y ver que falla**

Run: `node --test scripts/db-push.test.mjs`
Expected: FAIL (`planificar` no está exportada).

- [ ] **Step 3: Implementar `planificar` y usarla en el CLI**

- [ ] **Step 4: Correr y ver que pasa**

Run: `node --test scripts/db-push.test.mjs`
Expected: 3 passed.

- [ ] **Step 5: Las 5 versiones fantasma de prod**

`20260611155800`, `20260611163152`, `20260611170315`, `20260611172251` y
`20260611181537` no tienen archivo. Se agregan a la variable de repo
`MIGRACIONES_EXTERNAS` (`gh variable set MIGRACIONES_EXTERNAS --body "…"`), con un
comentario en `AGENTS.md` que explica de dónde vienen. No se tocan las filas de prod.

- [ ] **Step 6: Commit**

```bash
git add scripts/db-push.mjs scripts/db-push.test.mjs
git commit -m "ci(afin): db-push frena ante migraciones remotas desconocidas"
```

### Task 6: Hotfix combinado, convenciones y ramas

**Files:**
- Modify: `.github/workflows/hotfix-prod.yml`
- Create: `.github/workflows/para-probar-stg.yml`, copiado de New Haze
- Create: `AGENTS.md`, con las secciones «Convención de Pull Requests» y «Merge a stg» de
  New Haze adaptadas a AFIN (URLs de stg.afinsrl.com.ar), más las reglas de este plan
- Modify: `CLAUDE.md`: `@AGENTS.md`
- Create: `docs/adr/0006-plataforma-de-newhaze.md`: sustituye a ADR-0004 y en parte a
  ADR-0005 (los release toggles; los ops toggles siguen)

- [ ] **Step 1: Hotfix**

Se conserva el `hotfix-prod.yml` de AFIN (E2E con las variables de prod, verificación
`READY`, rollback). Se le agrega el paso de migraciones de New Haze (`node
scripts/db-push.mjs` con `SUPABASE_PROJECT_REF=myzngskhjnrmnonrksmj`) antes del merge,
y `back-merge-dev` pasa a ser `back-merge-stg`. El disparo queda solo en
`workflow_dispatch`.

- [ ] **Step 2: Verificar**

Run: `npx --yes @action-validator/cli .github/workflows/*.yml && node scripts/check-workflow-permissions.mjs && grep -rn "\bdev\b" .github/workflows`
Expected: sin errores y sin referencias a la rama `dev`.

- [ ] **Step 3: Commit, push y PR a `stg`**

```bash
git add .github AGENTS.md CLAUDE.md docs/adr/0006-plataforma-de-newhaze.md
git commit -m "ci(afin): hotfix combinado, para-probar-stg y convenciones de newhaze"
git push --force-with-lease origin ci/alinear-con-newhaze
```

En el cuerpo de PR #48 se escribe arriba: «Trae workflows: los revisa Guido».

- [ ] **Step 4: Después del merge: settings y ramas**

Run:
`gh api -X PATCH repos/GuidoAmici/afin-webapp -f delete_branch_on_merge=true`, y después
`git push origin --delete dev chore/31-drop-legacy-supabase-key-fallback ci/endurecer-pipeline fix/issue-10-server-side-price hotfix/home-ocultar-clientes release-please--branches--stg--components--afin-webapp`.
Antes de borrar, comprobar con `git merge-base --is-ancestor origin/<rama> origin/stg`
que cada una está contenida en `stg`. Si alguna no lo está, no se borra y se avisa.

- [ ] **Step 5: Verificar que un PR dispara el CI**

Abrir un PR trivial (o mirar el de la Task 7) y comprobar con `gh pr checks` que
corren `cambios`, `checks`, `pgtap` y `deploy-preview`.

---

## PR 3 — `feat/flags-newhaze`

### Task 7: Flags con `flags/next`, valor fijo por entorno

**Files:**
- Create: `flags.ts` (raíz, junto a `proxy.ts`)
- Create: `components/flags-provider.tsx` y `app/.well-known/vercel/flags/route.ts`,
  copiados de New Haze
- Delete: `lib/flags.ts` y `lib/flags.test.ts`
- Modify: `app/layout.tsx` (evalúa los flags y monta `FlagsProvider`), y los
  consumidores: `components/Header.tsx`, `components/AccountButton.tsx`,
  `components/CartModal.tsx`, `components/ProductModal.tsx`,
  `app/(public)/cuenta/pedidos/page.tsx`, `app/api/orders/route.ts`,
  `app/api/checkout/mp/route.ts`, `app/empleados/layout.tsx`, `app/auth/registro/page.tsx`
  y `app/actions/newsletter.ts`
- Create: `flags.test.ts`
- Modify: `package.json`: `"flags": "^4.2.0"`

**Interfaces:**
- Produces:
  - `porEntorno(produccion: boolean): () => boolean`, exportada.
  - Flags (clave → export): `pedidos` → `pedidosFlag`, `checkout-mp` → `checkoutMpFlag`,
    `registro-clientes` → `registroClientesFlag`, `newsletter` → `newsletterFlag`,
    `panel-productos` → `panelProductosFlag`, `panel-clientes` → `panelClientesFlag` y
    `zona-internos` → `zonaInternosFlag`. **Todos con `porEntorno(false)`**.
  - `ClientFlags = { pedidos, checkoutMp, registroClientes, newsletter, panelProductos, panelClientes, zonaInternos }`,
    todos `boolean`, y el hook `useFlags(): ClientFlags`.
- `lib/settings.ts` (ops toggles) no cambia.

- [ ] **Step 1: Escribir los tests**

```ts
test('en production devuelve el valor de producción', () => {
  vi.stubEnv('VERCEL_ENV', 'production')
  expect(porEntorno(false)()).toBe(false)
})
test('en preview y en desarrollo, encendido', () => {
  vi.stubEnv('VERCEL_ENV', 'preview'); expect(porEntorno(false)()).toBe(true)
  vi.stubEnv('VERCEL_ENV', ''); expect(porEntorno(false)()).toBe(true)
})
test('POST /api/orders con pedidos apagado responde 404', async () => {
  vi.stubEnv('VERCEL_ENV', 'production')
  const res = await POST(new Request('http://x/api/orders', { method: 'POST', body: '{}' }))
  expect(res.status).toBe(404)
})
test('POST /api/checkout/mp con checkout-mp apagado responde 404', async () => { /* ídem */ })
```

Los dos últimos van en `tests/unit/flags-gates.test.ts`.

- [ ] **Step 2: Correr y ver que fallan**

Run: `npx vitest run flags.test.ts tests/unit/flags-gates.test.ts`
Expected: FAIL (el módulo `@/flags` no existe).

- [ ] **Step 3: Implementar `flags.ts` como el `src/flags.ts` de New Haze, y migrar los consumidores**

Los server components y las route handlers usan `await <flag>()`. Los client components
usan `useFlags()`. Con un flag apagado, cada ruta responde como hoy: 404 en las APIs y
`notFound()` en las páginas. `registro-clientes` apagado hace `notFound()` en
`/auth/registro` y saca el link de registro de `LoginModal`. `newsletter` apagado saca el
formulario y hace que la action devuelva error.

- [ ] **Step 4: Correr y ver que pasan, junto con todo lo demás**

Run: `npm run lint && npm run typecheck && npm test`
Expected: todo en verde. `grep -rn "NEXT_PUBLIC_FF_" app components lib` sin salida.

- [ ] **Step 5: Commit y PR a `stg`**

```bash
git add -A flags.ts flags.test.ts components app lib tests/unit package.json package-lock.json
git commit -m "feat(afin): flags con flags/next, apagados en producción"
```

PR a `stg`. En «Verificado automáticamente» va un `curl` a la ruta de cada flag en el
preview (encendido) y la salida del test de producción (apagado).

---

## PR 4 — `chore/auth-config`

### Task 8: Configuración de Auth en el repo

**Files:**
- Modify: `supabase/config.toml`, sección `[auth]` (como en New Haze, con `env()`)
- Create: `docs/adr/0007-config-de-auth-en-el-repo.md`

- [ ] **Step 1: Leer la configuración actual de los dos proyectos**

Run (en la terminal de Guido, porque el clasificador bloquea al agente):
`curl -s -H "Authorization: Bearer $AFIN_SUPABASE_PAT" https://api.supabase.com/v1/projects/<ref>/config/auth > <scratchpad>/auth-<ref>.json`
para cada proyecto. El agente lee solo `site_url`, `uri_allow_list`,
`password_min_length`, `mailer_autoconfirm`, `external_email_enabled` y `smtp_host`
(presente o no).

- [ ] **Step 2: Escribir `[auth]` con `env()`**

- `site_url = "env(SUPABASE_AUTH_SITE_URL)"`
- `additional_redirect_urls = ["env(SUPABASE_AUTH_ADDITIONAL_REDIRECT_URLS)"]`
- `minimum_password_length = 8`
- `enable_confirmations = true`

Valores por entorno, en Doppler `afin-webapp` (`stg` y `prod`):
- stg: `https://stg.afinsrl.com.ar`, con `https://stg.afinsrl.com.ar/**`,
  `http://localhost:3000/**` y `http://127.0.0.1:3000/**`.
- prod: `https://afinsrl.com.ar`, con `https://afinsrl.com.ar/**` y
  `https://www.afinsrl.com.ar/**`.

- [ ] **Step 3: Diff contra lo remoto**

Comparar el archivo con lo leído en el Step 1. Todo valor remoto que el archivo pisaría
y que no está en esta lista se anota en el PR, y Guido decide antes del push.

- [ ] **Step 4: Aplicar en test**

Run: `doppler run -p afin-webapp -c stg -- supabase config push --project-ref wbsvxdquzvsawmjoiwat`
Verificar: `admin@test.com` sigue entrando (el mismo `curl` de token del 2026-11-19).

- [ ] **Step 5: Commit y PR a `stg`**

En prod se aplica en el pase a prod (plan de ARCA), con confirmación de Guido.

---

## Fuera de este plan

- La migración de permisos, ARCA, el panel y el pase a prod: plan
  `afin-intern-panel/docs/superpowers/plans/2026-11-19-comprobantes-arca-en-supabase.md`.
- El release programado, el lint expand-only y el backup local del ADR-0029: AFIN los
  copia cuando New Haze los construya.
