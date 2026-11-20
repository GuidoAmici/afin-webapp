# La config de auth de Supabase se versiona en el repo

Adopta, para AFIN, el [ADR-0020 de New Haze](https://github.com/GuidoAmici/newhaze-webapp/blob/stg/docs/adr/0020-config-de-auth-versionada-en-el-repo.md), y es parte de [ADR-0006](0006-plataforma-de-newhaze.md).

`supabase/config.toml` describía sólo el stack local; los proyectos remotos (test `wbsvxdquzvsawmjoiwat` y prod `myzngskhjnrmnonrksmj`) se configuraban por dashboard. Un `site_url` o una lista de redirects que se desalinea del dominio real no aparece en ningún diff ni rompe ningún check: es el mismo punto ciego que New Haze pagó con el retorno por mail caído en sus dos entornos.

Se decidió que la config de auth vive en `supabase/config.toml` y se aplica con `supabase config push`:

- **`site_url`, `additional_redirect_urls` y `enable_signup` salen de variables** (`SUPABASE_AUTH_SITE_URL`, `SUPABASE_AUTH_ADDITIONAL_REDIRECT_URLS`, `SUPABASE_AUTH_ENABLE_SIGNUP`), porque difieren entre stg y prod. El CLI resuelve `env()` también para booleanos (verificado con CLI 2.109: un valor distinto de `true`/`false`, o la variable sin definir, corta con `cannot parse value as 'bool'`). Los valores viven en Doppler `afin-webapp`, configs `stg` y `prod`; el stack local los toma de `supabase/env/local.env`.
- **Valores por entorno.**
  - stg: `site_url = https://stg.afinsrl.com.ar`; redirects = los que hoy tiene el proyecto (callback de stg, `localhost:3000` y los patrones de preview de Vercel, sin los cuales el login falla en los previews); `enable_signup = true`.
  - prod: `site_url = https://afinsrl.com.ar`; redirects `https://afinsrl.com.ar/**` y `https://www.afinsrl.com.ar/**`; `enable_signup = false` (el registro de clientes está detrás del flag apagado `registro-clientes`; las cuentas del equipo se crean por invitación, que funciona con el registro cerrado).
- **`minimum_password_length = 8` y `enable_confirmations = true`** quedan fijos en el archivo. Los usuarios existentes conservan su contraseña: el login no revisa el largo. `enable_confirmations = true` coincide con `mailer_autoconfirm = false` de los dos proyectos; con el valor anterior del archivo (`false`) el push habría activado el autoconfirm.
- **`scripts/auth-config-push.sh <stg|prod>` es la única vía de push.** Carga los valores de Doppler, corta si falta alguna de las tres variables (o si `ENABLE_SIGNUP` no es `true`/`false`) y recién entonces corre `supabase config push --project-ref <ref>`. Sin el guard, una variable vacía deja el literal `env(...)` como `site_url` del proyecto.

## Considered Options

**Seguir por dashboard y documentar los valores:** se descartó. Un documento describe lo que alguien decidió y no detecta que la realidad dejó de coincidir.

**Pushear desde CI en cada merge:** se descartó por ahora. `config push` pisa todo valor que el archivo declare, y los proyectos tienen config sin auditar; hasta que el archivo sea fiel a los dos entornos, el push es deliberado.

**La lista de redirects de New Haze (`/**` de stg y localhost):** se descartó para stg. Rompería el login en los previews de Vercel, que hoy están en la lista.

## Consequences

- `supabase config push` aplica el archivo completo: todo valor de auth, storage o API que el archivo declare y el dashboard difiera, se pisa. El diff que muestra el CLI se revisa antes de confirmar.
- Aplicar la config a cada proyecto es un paso manual, con la confirmación de Guido: primero test, y prod dentro del pase a prod. Este ADR no los aplica.
- Un campo ausente del archivo queda con el default del CLI, no "sin tocar" (el primer push de New Haze apagó `mfa.totp` así). Antes del primer push a cada proyecto se audita todo lo que el archivo declara, no sólo lo que se quiere cambiar.
- `[storage.vector] enabled = true` falló con 402 en los proyectos free tier de New Haze; hay que revisarlo en el diff antes de confirmar.
- Quien levante el stack local sin cargar `supabase/env/local.env` tiene un error explícito en vez de un `site_url` literal en los mails.
