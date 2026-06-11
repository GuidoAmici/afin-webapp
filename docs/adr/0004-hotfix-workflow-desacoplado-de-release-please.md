# Hotfix workflow desacoplado del flujo de Release Please

`dev-ci.yml` mergea automáticamente todo lo que llega a `dev` hacia `stg`. Esto hace que `stg` acumule features incompletos junto con bugfixes. Release Please agrupa el estado completo de `stg` en cada PR a `prod`, por lo que un hotfix urgente no puede llegar a producción de forma independiente sin arrastrar código no listo.

Se decidió introducir un tercer workflow (`hotfix-prod.yml`) que opera sobre ramas `hotfix/*` cortadas desde `prod`. Al hacer push a una rama `hotfix/*`, el workflow corre lint + type-check + Playwright con variables de producción, mergea directamente a `prod`, deploya a Vercel, y hace back-merge automático a `dev`. No incluye migraciones de Supabase — cualquier hotfix que requiera un cambio de schema debe ir por el flujo normal de Release Please.

## Considered Options

**Git tag sobre commit en `dev`:** se descartó porque `dev` ya contiene los features incompletos; etiquetar un commit no aísla los cambios — el workflow igualmente arrastraría todo lo que está delante en el historial.

**Stg → prod directo para hotfixes:** se descartó por la misma razón — `stg` es una copia de `dev` y ya está "contaminado" con el trabajo en curso.

## Consequences

- Las ramas `hotfix/*` son el único camino que bypasea `stg`. Todo lo demás sigue pasando por el flujo `dev → stg → Release Please → prod`.
- El back-merge a `dev` es obligatorio: sin él, el próximo push a `dev` reemplazaría el fix en `stg` vía el merge con `-X theirs`, y Release Please eventualmente pisaría el fix en `prod`.
- No se hace back-merge a `stg` explícitamente; el fix llega solo en el próximo push a `dev`.
