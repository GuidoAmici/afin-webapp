import { test } from "node:test";
import assert from "node:assert/strict";
import { decidirDesconocidas, planificar } from "./db-push.mjs";

test("una remota sin archivo frena", () => {
  const r = planificar({ locales: ["1_a", "2_b"], remotas: ["1_a", "9_x"], externas: [] });
  assert.deepEqual(r.desconocidas, ["9_x"]);
});

test("una remota listada como externa no frena", () => {
  const r = planificar({ locales: ["1_a"], remotas: ["1_a", "9_x"], externas: ["9_x"] });
  assert.deepEqual(r.desconocidas, []);
});

test("aplica en orden las locales que faltan", () => {
  const r = planificar({ locales: ["1_a", "3_c", "2_b"], remotas: ["1_a"], externas: [] });
  assert.deepEqual(r.aplicar, ["2_b", "3_c"]);
});

test("frenar con desconocidas no sigue", () => {
  const r = decidirDesconocidas(["9_x"], "frenar");
  assert.equal(r.seguir, false);
  assert.match(r.mensaje, /9_x/);
});

test("avisar con desconocidas sigue con un ::warning::", () => {
  const r = decidirDesconocidas(["9_x"], "avisar");
  assert.equal(r.seguir, true);
  assert.match(r.mensaje, /^::warning::.*9_x/);
});

test("sin desconocidas sigue en cualquier modo, sin mensaje", () => {
  for (const modo of ["frenar", "avisar", undefined]) {
    assert.deepEqual(decidirDesconocidas([], modo), { seguir: true, mensaje: null });
  }
});

test("un modo que no es avisar frena (falla hacia el lado seguro)", () => {
  assert.equal(decidirDesconocidas(["9_x"], undefined).seguir, false);
  assert.equal(decidirDesconocidas(["9_x"], "otro").seguir, false);
});
