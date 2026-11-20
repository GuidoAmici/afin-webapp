# AFIN adopta la plataforma de entrega de New Haze

Supersedes [ADR-0004](0004-hotfix-workflow-desacoplado-de-release-please.md) y, sólo en lo que toca a los release toggles, [ADR-0005](0005-feature-flags-por-variable-de-entorno.md).

El flujo de AFIN era `dev → stg → Release Please → prod`, con un hotfix aparte que bypaseaba `stg`. Tres ramas largas y un tercer camino a producción significan que `stg` acumula trabajo incompleto, que el hotfix se desvía de lo que se prueba en `stg` y que cada rama larga es una fuente de conflictos. New Haze, que comparte operador y herramientas, ya resolvió el mismo problema con una plataforma más chica y más probada.

Se decidió adoptar esa plataforma:

- **Dos entornos, `stg` y `prod`.** La rama `dev` se retira. El trabajo vive en ramas cortas que salen de `stg` y vuelven a `stg` por PR; `prod` sólo recibe merges de `stg` (release) o de una rama `hotfix/*` (emergencia).
- **`stg-ci.yml` es el único CI.** Un PR contra `stg` aplica sus migraciones a la base de prueba al abrirse, para que el preview vea el schema del PR; por eso toda migración es expand-only.
- **`release-prod.yml` con gate fail-closed** (`scripts/release-gate.mjs`): un release sin migraciones nuevas sale solo; uno con migraciones espera a un humano. Las migraciones de prod se aplican antes del merge de código (database-first).
- **El hotfix se despacha a mano** (`workflow_dispatch`), corre las migraciones de prod con `scripts/db-push.mjs` antes del merge y hace back-merge a `stg`. Los pushes protegidos usan el token de la GitHub App, la única con bypass del ruleset «Protect stg and prod».
- **`db-push.mjs` frena ante migraciones remotas desconocidas** salvo que figuren en la variable `MIGRACIONES_EXTERNAS`.
- **Convenciones de PR y de merge a stg** en `AGENTS.md`, con el workflow `para-probar-stg.yml` que junta los ítems «Sólo vos» en un issue fijado.
- **Los release toggles se alinean con los de New Haze** (`flags` detrás de apagado en prod para lo nuevo y visible). Los ops toggles de `settings` no cambian.

## Considered Options

**Mantener `dev` y sólo agregar el gate:** se descartó. El problema de fondo es el tercer camino a prod y las ramas largas, no la falta de un gate.

**Seguir con el hotfix disparado por push a `hotfix/*`:** se descartó. Un hotfix puede tocar la base de prod; que lo dispare un push, sin una persona que lo despache, es demasiado fácil de activar por accidente.

**Un flujo propio para AFIN:** se descartó. Dos operadores con dos plataformas distintas duplican el mantenimiento y los errores que New Haze ya pagó.

## Consequences

- Las ramas largas desaparecen: una feature a medio hacer entra a `stg` detrás de un flag apagado en prod, no se queda esperando en una rama.
- Un PR con migración la aplica a la base de `stg` al abrirse. Si se cierra sin mergear, la migración queda en esa base y se limpia a mano (ver `AGENTS.md`).
- Los releases con migraciones no salen solos: los despacha una persona.
- El hotfix ahora puede traer migraciones, con la misma regla expand-only y el mismo orden database-first que un release.
- `MIGRACIONES_EXTERNAS` documenta lo que prod tiene y el repo no; agregar una versión ahí es una decisión de Guido, no del agente.
- Las ADR 0004 y 0005 quedan como historia, con una nota que apunta a esta.
