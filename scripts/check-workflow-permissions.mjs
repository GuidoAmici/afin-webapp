#!/usr/bin/env node
// Un workflow reusable no puede elevar permisos por encima de quien lo llama.
// Si `uses: ./.github/workflows/X.yml` pide un permiso que el job llamador no
// concede, GitHub falla el run ENTERO al arrancar: "workflow file issue", sin
// log en ningún job y sin decir cuál es el permiso.
//
// El modo de falla es peor que un test rojo: no se ve en el CI del PR, porque
// el job que invoca suele estar detrás de `if: github.event_name == 'push'`.
// Pasó al mergear #173, que agregó `issues: write` a release-prod.yml sin
// tocar el job de stg-ci.yml que lo llama, y dejó la Stg CI sin arrancar.
//
// actionlint no lo detecta (probado sobre el estado roto exacto).

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

const DIR = ".github/workflows";
const RANK = { none: 0, read: 1, write: 2 };

/** Permisos efectivos de un job: los suyos si los declara, si no los del workflow. */
function permisosDe(doc, job) {
  const p = job?.permissions ?? doc?.permissions ?? {};
  // `permissions: read-all | write-all | {}` — las formas de atajo.
  if (typeof p === "string") {
    const nivel = p === "write-all" ? "write" : p === "read-all" ? "read" : "none";
    return { __todos: nivel };
  }
  return p;
}

function concede(otorgados, pedido) {
  if (otorgados.__todos) return RANK[otorgados.__todos] >= RANK[pedido];
  return false;
}

const archivos = readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f));
const docs = new Map(archivos.map((f) => [f, parse(readFileSync(join(DIR, f), "utf8"))]));
const problemas = [];

for (const [archivo, doc] of docs) {
  for (const [nombreJob, job] of Object.entries(doc?.jobs ?? {})) {
    const uses = job?.uses;
    if (typeof uses !== "string" || !uses.startsWith("./.github/workflows/")) continue;

    const destino = uses.replace("./.github/workflows/", "").split("@")[0];
    const docDestino = docs.get(destino);
    if (!docDestino) {
      problemas.push(`${archivo} › job "${nombreJob}" invoca ${destino}, que no existe`);
      continue;
    }

    const otorgados = permisosDe(doc, job);
    const pedidos = docDestino.permissions ?? {};
    if (typeof pedidos === "string") continue; // write-all en el llamado: caso raro, no se modela

    for (const [permiso, nivel] of Object.entries(pedidos)) {
      const tiene = otorgados[permiso];
      const ok = tiene ? RANK[tiene] >= RANK[nivel] : concede(otorgados, nivel);
      if (!ok) {
        problemas.push(
          `${archivo} › job "${nombreJob}" invoca ${destino}, que pide "${permiso}: ${nivel}", ` +
            `pero el job sólo tiene "${permiso}: ${tiene ?? "ninguno"}". ` +
            `El run no va a arrancar. Agregá el permiso al job "${nombreJob}" en ${archivo}.`,
        );
      }
    }
  }
}

if (problemas.length) {
  for (const p of problemas) console.error(`::error::${p}`);
  console.error(`\n${problemas.length} problema(s) de permisos en workflow_call.`);
  process.exit(1);
}
console.log("Permisos de workflow_call: cada llamador concede lo que su llamado pide.");
