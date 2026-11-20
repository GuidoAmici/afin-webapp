#!/usr/bin/env node
// Guard del stack local de Supabase, compartido entre worktrees.
//
// Los puertos del stack están fijos en supabase/config.toml (api 55321, db
// 55322): hay UN stack por máquina, no uno por worktree. Cuando varios agentes
// trabajan en paralelo, el esquema cargado en ese stack es el de la rama del
// que lo reseteó último — y cualquier otro worktree que corra `db:types` o la
// suite E2E local lee un esquema que no es el suyo. No falla: genera tipos o
// resultados de otra rama, en silencio.
//
// El guard registra qué worktree "posee" el estado actual del stack en un
// archivo dentro del .git común (compartido por todos los worktrees, y fuera
// del árbol de trabajo de cualquiera de ellos). Si otro worktree lo tiene
// tomado, corta con un mensaje que dice quién y desde cuándo.
//
// No pretende ser un lock a prueba de carreras: es un detector de colisión
// entre agentes, que convierte un resultado silenciosamente equivocado en un
// error explícito.
//
// Uso:
//   node scripts/supabase-guard.mjs check     # falla si el stack es de otro
//   node scripts/supabase-guard.mjs status    # informa, nunca falla
//   node scripts/supabase-guard.mjs release   # suelta el stack (si es tuyo)
//   node scripts/supabase-guard.mjs release --force   # lo suelta igual
//
// Escapes: SUPABASE_GUARD=off lo desactiva; en CI no corre (cada job tiene su
// propia máquina, así que no hay nada que compartir).

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const accion = process.argv[2] ?? 'check';

if (process.env.CI || process.env.SUPABASE_GUARD === 'off') process.exit(0);

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

const raiz = git('rev-parse', '--show-toplevel');
const rama = git('rev-parse', '--abbrev-ref', 'HEAD');
const LOCK = path.join(git('rev-parse', '--path-format=absolute', '--git-common-dir'), 'supabase-local-owner.json');

// El puerto sale del config, no hardcodeado: si alguien lo cambia, el guard lo sigue.
function puertoApi() {
  try {
    const toml = readFileSync('supabase/config.toml', 'utf8');
    const api = toml.split(/^\[/m).find((s) => s.startsWith('api]'));
    return Number(api?.match(/^port\s*=\s*(\d+)/m)?.[1] ?? 55321);
  } catch {
    return 55321;
  }
}

// ¿Hay algo escuchando? Si el stack está apagado no hay estado que pisar.
function stackLevantado(puerto) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: '127.0.0.1', port: puerto });
    const cerrar = (r) => { sock.destroy(); resolve(r); };
    sock.setTimeout(600);
    sock.on('connect', () => cerrar(true));
    sock.on('timeout', () => cerrar(false));
    sock.on('error', () => cerrar(false));
  });
}

function leerDueño() {
  if (!existsSync(LOCK)) return null;
  try {
    return JSON.parse(readFileSync(LOCK, 'utf8'));
  } catch {
    return null; // lock corrupto: se trata como si no hubiera dueño
  }
}

function tomar() {
  writeFileSync(LOCK, JSON.stringify({ worktree: raiz, rama, desde: new Date().toISOString() }, null, 2) + '\n');
}

const puerto = puertoApi();
const levantado = await stackLevantado(puerto);
const dueño = leerDueño();

if (accion === 'release') {
  const forzar = process.argv.includes('--force');
  // Soltar el stack de otro worktree es legítimo —la sesión dueña pudo haber
  // muerto sin liberarlo— pero se pide a propósito, para que no pase de largo.
  if (dueño && dueño.worktree !== raiz && !forzar) {
    console.error(`El stack lo tiene ${dueño.worktree} (${dueño.rama}).`);
    console.error('Si esa sesión ya no existe: npm run db:guard:release -- --force');
    process.exit(1);
  }
  rmSync(LOCK, { force: true });
  console.log('Stack local liberado.');
  process.exit(0);
}

if (accion === 'status') {
  console.log(`Stack local (:${puerto}): ${levantado ? 'levantado' : 'apagado'}`);
  console.log(dueño ? `Dueño: ${dueño.worktree} (${dueño.rama}) desde ${dueño.desde}` : 'Dueño: nadie');
  process.exit(0);
}

// check —— el modo por defecto, el que corre antes de cada comando.

// Stack apagado: no hay esquema de nadie que pisar. Se limpia un lock que
// quedó de una sesión anterior, para que el próximo `supabase start` empiece
// sin dueño heredado.
if (!levantado) {
  rmSync(LOCK, { force: true });
  process.exit(0);
}

if (dueño && dueño.worktree !== raiz) {
  console.error('');
  console.error('  El stack local de Supabase lo tiene otro worktree.');
  console.error('');
  console.error(`    dueño   ${dueño.worktree}`);
  console.error(`    rama    ${dueño.rama}`);
  console.error(`    desde   ${dueño.desde}`);
  console.error('');
  console.error(`  Este worktree es ${raiz} (${rama}). El esquema cargado en el`);
  console.error('  stack es el de la otra rama: los tipos o los tests que salgan de');
  console.error('  acá serían de un esquema que no es el tuyo.');
  console.error('');
  console.error('  Esperá a que ese agente termine. Si esa sesión ya no existe:');
  console.error('  `npm run db:guard:release -- --force` y reseteá el stack para tu rama.');
  console.error('');
  process.exit(1);
}

// Nadie lo tenía, o ya era nuestro: queda registrado a nombre de este worktree.
tomar();
