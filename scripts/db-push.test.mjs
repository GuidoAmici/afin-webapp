import { test } from "node:test";
import assert from "node:assert/strict";
import { planificar } from "./db-push.mjs";

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
