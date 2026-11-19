import { test } from "node:test";
import assert from "node:assert/strict";
import { decidir } from "./release-gate.mjs";

test("automático con migraciones pendientes: frena y deja el comando manual", () => {
  const r = decidir({ automatico: true, migracionesPendientes: 3 });
  assert.equal(r.seguir, false);
  assert.match(r.motivo, /gh workflow run release-prod\.yml/);
});

test("automático sin migraciones pendientes: sale solo", () => {
  assert.equal(decidir({ automatico: true, migracionesPendientes: 0 }).seguir, true);
});

test("disparo manual: el gate no aplica, aunque haya migraciones", () => {
  assert.equal(decidir({ automatico: false, migracionesPendientes: 3 }).seguir, true);
});

test("automático con conteo no numérico o ausente: fail-closed", () => {
  for (const n of [undefined, null, "", "abc", NaN, -1, 1.5]) {
    assert.equal(
      decidir({ automatico: true, migracionesPendientes: n }).seguir,
      false,
      `conteo ${String(n)}`,
    );
  }
});
