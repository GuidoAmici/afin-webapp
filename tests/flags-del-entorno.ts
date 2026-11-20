import { test } from '@playwright/test'

/**
 * Los specs de tests/ corren contra servidores con flags distintos:
 *   - preview y stg (stg-ci.yml) y `npm run dev` local: todos encendidos.
 *   - hotfix (hotfix-prod.yml): un dev server con las variables de producción,
 *     donde todo lo nuevo y visible arranca apagado.
 *
 * El valor se calcula con el mismo `decide` de `flags.ts` que usa el servidor,
 * que lee `VERCEL_ENV`. Por eso el run tiene que tener el `VERCEL_ENV` del
 * servidor que prueba: hotfix-prod.yml lo setea en `production` en el paso de
 * Playwright (y el dev server lo hereda); contra un preview queda vacío.
 */
type FlagDeRelease = {
  key: string
  decide?: (params: never) => boolean | PromiseLike<boolean>
}

/**
 * Saltea el test, con el motivo, si `flag` está apagado en el entorno del run.
 * Va adentro del test, antes del primer paso que necesita la feature.
 */
export async function requiereFlag(flag: FlagDeRelease) {
  // Todos los flags de flags.ts declaran `decide`; uno sin él no se puede evaluar acá.
  if (!flag.decide) throw new Error(`El flag «${flag.key}» no tiene decide: no se puede saber si está encendido.`)
  const encendido = await flag.decide(undefined as never)
  const entorno = process.env.VERCEL_ENV || 'sin VERCEL_ENV'
  test.skip(
    !encendido,
    `El flag «${flag.key}» está apagado en este entorno (${entorno}): la feature no existe y el paso no aplica.`,
  )
}
