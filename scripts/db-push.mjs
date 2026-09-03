#!/usr/bin/env node
// Aplica las migraciones locales que falten en el proyecto Supabase (issue #39).
//
// Equivalente CI-friendly de `supabase db push`, sin password de DB: usa la
// Management API con el PAT (SUPABASE_ACCESS_TOKEN) y registra el historial en
// supabase_migrations.schema_migrations igual que el CLI. Cada migración se
// aplica junto con su registro en una sola llamada (transacción única): si
// falla, no queda ni el cambio ni el registro.
//
// Uso:
//   SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... node scripts/db-push.mjs

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

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

let applied = 0;
for (const f of files) {
  const version = f.split('_')[0];
  const name = f.slice(version.length + 1, -4);
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
  if (remote.has(version)) {
    if (remote.get(version) !== name) {
      throw new Error(
        `Colisión de timestamp en ${f}: la version ${version} ya está registrada en ${ref} ` +
          `con el nombre "${remote.get(version)}". Renombrá tu migración con otro timestamp ` +
          `(si en cambio renombraste un archivo ya aplicado, actualizá el historial a mano).`,
      );
    }
    continue;
  }
  const sql = await readFile(path.join(MIG_DIR, f), 'utf8');
  const esc = sql.replaceAll("'", "''");
  console.log(`Aplicando ${f}…`);
  await query(
    `${sql}\nINSERT INTO supabase_migrations.schema_migrations (version, name, statements) VALUES ('${version}', '${name}', ARRAY['${esc}']);`,
  );
  applied += 1;
}

console.log(applied ? `✓ ${applied} migración(es) aplicada(s) a ${ref}.` : `✓ ${ref} al día: sin migraciones pendientes.`);
