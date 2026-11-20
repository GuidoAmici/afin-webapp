#!/usr/bin/env node
// Aplica las migraciones locales que falten en el proyecto Supabase (issue #39).
//
// Equivalente CI-friendly de `supabase db push`, sin password de DB: usa la
// Management API con el PAT (SUPABASE_ACCESS_TOKEN) y registra el historial en
// supabase_migrations.schema_migrations igual que el CLI. Cada migración se
// aplica junto con su registro en una sola llamada (transacción única): si
// falla, no queda ni el cambio ni el registro.
//
// Versiones remotas sin archivo local y no declaradas en MIGRACIONES_EXTERNAS
// («desconocidas»): qué se hace con ellas lo decide DESCONOCIDAS.
//  - `frenar` (default, prod: release y hotfix): exit 1 sin aplicar nada. Una
//    DB que avanzó por fuera del repo no se pisa en silencio.
//  - `avisar` (sólo la base de prueba, migrate-stg): ::warning:: y sigue. Ahí
//    un PR de migración abierto aplica su archivo antes del merge, y las demás
//    ramas no lo tienen: frenar dejaría en rojo cada push a stg y cada otro PR
//    de base mientras ese PR siga abierto.
// El guard de colisión de nombre frena en los dos modos.
//
// Uso:
//   SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... \
//   [MIGRACIONES_EXTERNAS=ver1,ver2] [DESCONOCIDAS=frenar|avisar] node scripts/db-push.mjs

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// La identidad de una migración es su version: el timestamp antes del primer
// `_` (es lo que el historial remoto guarda en `version`).
const versionDe = (x) => String(x).split('_')[0];

// Decide qué aplicar y qué frena. Pura: sin red ni disco.
//  - locales: nombres de archivo (`<version>_<nombre>.sql` o `1_a` en tests)
//  - remotas: versiones ya registradas en el historial remoto
//  - externas: versiones remotas sin archivo local que se aceptan a propósito
// Devuelve `aplicar` (locales que faltan en remoto, en orden, tal como vinieron)
// y `desconocidas` (remotas sin archivo local y no declaradas como externas).
export function planificar({ locales, remotas, externas }) {
  const vLocales = new Set(locales.map(versionDe));
  const vRemotas = new Set(remotas.map(versionDe));
  const vExternas = new Set(externas.map(versionDe));
  const aplicar = locales
    .filter((f) => !vRemotas.has(versionDe(f)))
    .sort((a, b) => (versionDe(a) < versionDe(b) ? -1 : versionDe(a) > versionDe(b) ? 1 : 0));
  const desconocidas = remotas.filter((r) => !vLocales.has(versionDe(r)) && !vExternas.has(versionDe(r)));
  return { aplicar, desconocidas };
}

// Qué hacer con las versiones desconocidas según el modo. Pura.
// Devuelve `seguir` (si se aplica lo pendiente) y `mensaje` (null si no hay
// nada que decir). Un modo que no es `avisar` frena: falla hacia el lado seguro.
export function decidirDesconocidas(desconocidas, modo) {
  if (!desconocidas.length) return { seguir: true, mensaje: null };
  const lista = desconocidas.join(', ');
  if (modo === 'avisar') {
    return {
      seguir: true,
      mensaje:
        `::warning::${desconocidas.length} migración(es) remota(s) sin archivo local: ${lista}. ` +
        `Se sigue (DESCONOCIDAS=avisar): suele ser un PR de migración abierto. Si el PR se cerró ` +
        `sin mergear, limpiá su migración de la base de prueba (ver AGENTS.md).`,
    };
  }
  return {
    seguir: false,
    mensaje:
      `✗ ${desconocidas.length} migración(es) remota(s) sin archivo local y no declaradas: ${lista}.\n` +
      `  No se aplicó nada. Traé el archivo al repo o, si es a propósito, agregá la version a ` +
      `MIGRACIONES_EXTERNAS (variable del repo, lista separada por comas).`,
  };
}

async function main() {
  const ref = process.env.SUPABASE_PROJECT_REF;
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!ref || !token) {
    console.error('Faltan SUPABASE_PROJECT_REF y/o SUPABASE_ACCESS_TOKEN.');
    process.exit(1);
  }

  const API = `https://api.supabase.com/v1/projects/${ref}/database/query`;

  async function query(sql) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sql }),
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.slice(0, 800)}`);
    return body ? JSON.parse(body) : [];
  }

  const MIG_DIR = 'supabase/migrations';
  const files = (await readdir(MIG_DIR)).filter((f) => f.endsWith('.sql')).sort();

  // En un proyecto nunca migrado (p. ej. prod antes del primer release) el
  // historial no existe todavía.
  await query(`
    CREATE SCHEMA IF NOT EXISTS supabase_migrations;
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version text PRIMARY KEY,
      statements text[],
      name text
    );
  `);

  // version → name de lo ya aplicado. Se guarda el NOMBRE, no solo el timestamp:
  // ver el guard de colisión más abajo.
  const remote = new Map(
    (await query('SELECT version, name FROM supabase_migrations.schema_migrations')).map((r) => [
      r.version,
      r.name,
    ]),
  );

  // Guard de colisión de timestamp. El historial se indexa por VERSION
  // (el timestamp), no por nombre de archivo: dos ramas que eligen el mismo
  // `HHMMSS` del mismo día producen la misma version con archivos distintos, y
  // la segunda se saltaría EN SILENCIO — el historial diría "aplicada" y su DDL
  // nunca correría, dejando la DB divergida de los archivos con el run en VERDE.
  // Pasó de verdad en newhaze-webapp (#194). Este guard lo convierte en rojo.
  //
  // Esta misma firma (version repetida + name distinto) la produce también el
  // renombre de un archivo YA aplicado, y desde acá los dos casos son
  // indistinguibles. Decisión del maintainer (#201): fallan los dos — "nadie
  // cambia el nombre de una migración ya aplicada". O sea: EL NOMBRE DE UNA
  // MIGRACIÓN ES INMUTABLE UNA VEZ APLICADA. Si alguna vez hay que renombrar
  // una de verdad, hay que actualizar también su fila del historial.
  // Se chequea antes de aplicar nada, para no dejar la DB a medias.
  const nombreDe = (f) => f.slice(versionDe(f).length + 1, -4);
  for (const f of files) {
    const version = versionDe(f);
    if (remote.has(version) && remote.get(version) !== nombreDe(f)) {
      throw new Error(
        `Colisión de timestamp en ${f}: la version ${version} ya está registrada en ${ref} ` +
          `con el nombre "${remote.get(version)}". Renombrá tu migración con otro timestamp ` +
          `(si en cambio renombraste un archivo ya aplicado, actualizá el historial a mano).`,
      );
    }
  }

  // Versiones remotas sin archivo local: sólo pasan si están declaradas.
  const externas = (process.env.MIGRACIONES_EXTERNAS ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  const { aplicar, desconocidas } = planificar({ locales: files, remotas: [...remote.keys()], externas });
  const modo = process.env.DESCONOCIDAS || 'frenar';
  if (modo !== 'frenar' && modo !== 'avisar') {
    console.error(`DESCONOCIDAS="${modo}" no es un modo válido (frenar | avisar).`);
    process.exit(1);
  }
  const { seguir, mensaje } = decidirDesconocidas(desconocidas, modo);
  // `::warning::` tiene que abrir la línea para que Actions lo tome como anotación.
  if (mensaje) (seguir ? console.log : console.error)(mensaje);
  if (!seguir) process.exit(1);

  let applied = 0;
  for (const f of aplicar) {
    const version = versionDe(f);
    const name = nombreDe(f);
    const sql = await readFile(path.join(MIG_DIR, f), 'utf8');
    const esc = sql.replaceAll("'", "''");
    console.log(`Aplicando ${f}…`);
    await query(
      `${sql}\nINSERT INTO supabase_migrations.schema_migrations (version, name, statements) VALUES ('${version}', '${name}', ARRAY['${esc}']);`,
    );
    applied += 1;
  }

  console.log(applied ? `✓ ${applied} migración(es) aplicada(s) a ${ref}.` : `✓ ${ref} al día: sin migraciones pendientes.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main();
}
