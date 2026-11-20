#!/usr/bin/env node
// Gate de release-prod.yml: ¿sale solo o espera a un humano?
//
// Un cambio de copy y una migración de esquema no son el mismo riesgo: el código
// se revierte con un merge, una migración aplicada a la DB de producción no. El
// gate deja salir solo al primero y manda el segundo a un humano.
//
// La lógica vive acá y no inline en el YAML para poder probarla sin disparar el
// workflow (un dispatch manual saltea el gate y correría db-push contra prod).
//
// Fail-closed: si `automatico` es true y el conteo de migraciones no es un
// entero >= 0, no se sabe si hay migraciones y el release NO sale.

import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const COMANDO_MANUAL = "gh workflow run release-prod.yml";

/**
 * @param {{ automatico: boolean, migracionesPendientes: unknown }} entrada
 * @returns {{ seguir: boolean, motivo: string }}
 */
export function decidir({ automatico, migracionesPendientes }) {
  if (automatico !== true) {
    return {
      seguir: true,
      motivo: "Disparo manual: el gate de migraciones no aplica.",
    };
  }

  const n = typeof migracionesPendientes === "number" ? migracionesPendientes : Number.NaN;
  if (!Number.isInteger(n) || n < 0) {
    return {
      seguir: false,
      motivo:
        `No se pudo contar las migraciones de prod..stg (valor: ${String(migracionesPendientes)}). ` +
        `Un gate que perdió la capacidad de mirar frena. Para salir igual: ${COMANDO_MANUAL}`,
    };
  }

  if (n === 0) {
    return {
      seguir: true,
      motivo: "Ninguna migración en prod..stg. Release automático.",
    };
  }

  return {
    seguir: false,
    motivo:
      `El diff prod..stg trae ${n} migración(es), que no se revierten con un merge. ` +
      `Para salir igual: ${COMANDO_MANUAL}`,
  };
}

function main() {
  const automatico = process.env.AUTOMATICO === "true";
  const crudo = process.env.MIGRACIONES_PENDIENTES;
  const migracionesPendientes = crudo !== undefined && /^\d+$/.test(crudo.trim()) ? Number(crudo) : undefined;

  const { seguir, motivo } = decidir({ automatico, migracionesPendientes });
  console.log(motivo);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `seguir=${seguir}\n`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
