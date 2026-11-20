#!/usr/bin/env node
// Genera (o verifica) `lib/database.types.ts` desde el stack
// local, negándose a hacerlo cuando el esquema no está cargado.
//
// ── El modo de falla que esto cierra ────────────────────────────────────────
//
// `supabase start` levanta los servicios pero NO aplica las migraciones. Con
// la base vacía, `supabase gen types --local` **no falla**: genera un archivo
// TypeScript perfectamente válido de una base sin tablas, y el `>` del script
// viejo se comía las 2880 líneas del archivo real. Después `npm test` y el
// typecheck se caen en cascada en lugares que no tienen nada que ver, y el
// diagnóstico arranca con el pie izquierdo.
//
// Pasó dos veces el 2026-10-11, las dos agarradas de casualidad mirando
// `git diff --stat`. El guard de al lado no protege de esto: mira si hay algo
// escuchando en el puerto de la API, no si la base tiene esquema.
//
// ── Por qué compara contra el archivo commiteado y no contra un umbral ──────
//
// Un umbral ("al menos N tablas") es un número inventado que envejece. El
// archivo del repo, en cambio, ya es la cuenta correcta de la rama: si la
// generación trae MENOS tablas que las que el repo declara, el esquema no está
// completo. Y perder tablas es, por el contrato expand-only de ADR-0017, algo
// que no pasa por accidente.
//
// Un DROP legítimo existe —poco frecuente, pero existe—, así que hay escape:
// `--permitir-menos`. Explícito, para que quede en el historial de quien lo usó.
//
// Uso:
//   node scripts/db-types.mjs                    # genera y sobreescribe
//   node scripts/db-types.mjs --check            # compara, no escribe (CI)
//   node scripts/db-types.mjs --permitir-menos   # permite que bajen las tablas

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DESTINO = 'lib/database.types.ts';
const args = new Set(process.argv.slice(2));
const verificar = args.has('--check');
const permitirMenos = args.has('--permitir-menos');

/**
 * Cuenta las entradas de `Tables` del esquema `public` en un archivo generado.
 *
 * Se cuenta con conteo de llaves y no con una regex sobre la indentación,
 * porque la indentación es un detalle del generador: si cambia de versión, una
 * regex deja de matchear y el guard pasa a aprobar todo en silencio — que es
 * el peor resultado posible para un control.
 */
function contarTablas(fuente) {
  const inicio = fuente.indexOf('Tables: {');
  if (inicio === -1) return 0;

  let profundidad = 0;
  let tablas = 0;
  let i = fuente.indexOf('{', inicio);

  for (; i < fuente.length; i += 1) {
    const c = fuente[i];
    if (c === '{') {
      profundidad += 1;
      continue;
    }
    if (c === '}') {
      profundidad -= 1;
      if (profundidad === 0) break; // se cerró el bloque Tables
      continue;
    }
    // Una tabla es una clave en el primer nivel de anidamiento del bloque.
    //
    // El lookahead `(?=\{)` es deliberado: la llave NO entra en el match, así
    // que queda para que la cuente el contador de profundidad de arriba. Una
    // primera versión la consumía y adelantaba `i` por encima de ella — con lo
    // que la profundidad nunca subía, el primer `}` de adentro la bajaba a 0 y
    // el loop cortaba a las dos entradas. Daba "2 tablas" sobre un archivo de
    // 52: un control que siempre aprueba.
    if (profundidad === 1 && /[A-Za-z_]/.test(c)) {
      const clave = fuente.slice(i).match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(?=\{)/);
      if (clave) {
        tablas += 1;
        i += clave[0].length - 1;
      }
    }
  }
  return tablas;
}

let generado;
try {
  generado = execFileSync(
    'supabase',
    ['gen', 'types', 'typescript', '--local', '--schema', 'public'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
} catch (e) {
  console.error('✗ `supabase gen types` falló. ¿Está arriba el stack local? `supabase start`');
  if (e.stderr) console.error(String(e.stderr).trim());
  process.exit(1);
}

const tablasGeneradas = contarTablas(generado);
const tablasEnRepo = existsSync(DESTINO) ? contarTablas(readFileSync(DESTINO, 'utf8')) : 0;

if (tablasGeneradas === 0) {
  console.error(
    '✗ El stack local no tiene esquema: la generación trajo CERO tablas.\n' +
      '  `supabase start` levanta los servicios pero no aplica las migraciones.\n' +
      '  Corré `supabase db reset` y volvé a intentar.',
  );
  process.exit(1);
}

if (tablasGeneradas < tablasEnRepo && !permitirMenos) {
  console.error(
    `✗ La generación trajo ${tablasGeneradas} tablas y el repo declara ${tablasEnRepo}.\n` +
      '  Suele significar que el stack local tiene el esquema de otra rama, o uno\n' +
      '  a medio aplicar: corré `supabase db reset` en ESTE worktree.\n' +
      '  Si de verdad estás borrando tablas, repetí con --permitir-menos.',
  );
  process.exit(1);
}

if (verificar) {
  const actual = existsSync(DESTINO) ? readFileSync(DESTINO, 'utf8') : '';
  if (actual === generado) {
    console.log(`✓ Los tipos coinciden con el esquema (${tablasGeneradas} tablas).`);
    process.exit(0);
  }
  console.error(
    '✗ `database.types.ts` no coincide con las migraciones (database-first, ADR-0001).\n' +
      '  Corré `npm run db:types` y commiteá el resultado.',
  );
  process.exit(1);
}

writeFileSync(DESTINO, generado);
console.log(`✓ ${DESTINO} regenerado desde el esquema local (${tablasGeneradas} tablas).`);
