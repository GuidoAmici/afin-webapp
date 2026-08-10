-- pgTAP: ops flags en `settings` — keys sembradas y escritura admin-only.
-- Cubre la migración ops_flags_settings, que además corrige que la policy
-- original chequeaba = 'empleado' y dejaba afuera al admin.
-- Corre con `supabase test db` (stack local, no toca stg/prod).

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

BEGIN;
SELECT plan(10);

-- ── Setup (como postgres) ────────────────────────────────────────────────
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('21212121-2121-2121-2121-212121212121', 'empleado-flags@test.dev', '{"nombre":"Empleado Test"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'admin-flags@test.dev',    '{"nombre":"Admin Test"}'::jsonb);

-- ════════════════════════════════════════════════════════════════════════
-- Las keys quedaron sembradas con su default
-- ════════════════════════════════════════════════════════════════════════

-- 1) kill switch de cobros: arranca prendido (fail-open)
SELECT is((SELECT value FROM public.settings WHERE key = 'payments_enabled'),
  'true'::jsonb, 'payments_enabled arranca en true');

-- 2) transferencia: apagada hasta que la feature exista (#15)
SELECT is((SELECT value FROM public.settings WHERE key = 'transfer_enabled'),
  'false'::jsonb, 'transfer_enabled arranca en false');

-- 3) job de expiración: apagado hasta que exista (#19)
SELECT is((SELECT value FROM public.settings WHERE key = 'order_expiry_enabled'),
  'false'::jsonb, 'order_expiry_enabled arranca en false');

-- 4) y su ventana, la del PRD
SELECT is((SELECT value FROM public.settings WHERE key = 'order_expiry_days'),
  '7'::jsonb, 'order_expiry_days arranca en 7');

-- 5) no se pisaron las keys que ya existían (el INSERT es ON CONFLICT DO NOTHING)
SELECT is((SELECT value FROM public.settings WHERE key = 'transfer_discount_pct'),
  '5'::jsonb, 'la migración no pisa transfer_discount_pct preexistente');

-- ════════════════════════════════════════════════════════════════════════
-- RLS vigente (la fijó transition_order.sql, esta migración no la toca):
-- lee cualquier autenticado, escribe staff = empleado ∪ admin.
--
-- PRD-0002 (historias 21/22/26) pide que editar descuento y datos bancarios sea
-- admin-only. Estos tests documentan lo que la base hace HOY, que es más
-- permisivo; si se decide restringirlo, el test 7 es el que tiene que cambiar.
-- ════════════════════════════════════════════════════════════════════════
-- Igual que en harden_security_test: en cloud los grants de tabla vienen de los
-- default privileges de Supabase, que el stack local no tiene. Los reproducimos
-- para que el test ejercite la RLS y no la mera ausencia del grant.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;

-- ── Como empleado ────────────────────────────────────────────────────────
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"21212121-2121-2121-2121-212121212121","app_metadata":{"role":"empleado"}}', true);

-- 6) el empleado lee la configuración
SELECT ok((SELECT count(*) FROM public.settings WHERE key = 'payments_enabled') = 1,
  'el empleado puede leer settings');

-- 7) y hoy también puede escribirla — incluido el kill switch de cobros
UPDATE public.settings SET value = 'false'::jsonb WHERE key = 'payments_enabled';
SELECT is((SELECT value FROM public.settings WHERE key = 'payments_enabled'),
  'false'::jsonb, 'el empleado puede apagar payments_enabled (modelo is_staff vigente)');

-- ── Como admin ───────────────────────────────────────────────────────────
SELECT set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","app_metadata":{"role":"admin"}}', true);

-- 8) el admin también, por supuesto
UPDATE public.settings SET value = 'true'::jsonb WHERE key = 'payments_enabled';
SELECT is((SELECT value FROM public.settings WHERE key = 'payments_enabled'),
  'true'::jsonb, 'el admin puede volver a prender payments_enabled');

-- ── Como cliente ─────────────────────────────────────────────────────────
SELECT set_config('request.jwt.claims',
  '{"sub":"21212121-2121-2121-2121-212121212121","app_metadata":{"role":"cliente"}}', true);

-- 9) el cliente lee (necesita descuento y datos bancarios para el checkout)
SELECT ok((SELECT count(*) FROM public.settings WHERE key = 'transfer_discount_pct') = 1,
  'el cliente puede leer settings');

-- 10) pero no escribe: acá sí la RLS lo corta
SELECT throws_ok(
  $$ INSERT INTO public.settings (key, value) VALUES ('cliente_hack', 'true'::jsonb) $$,
  '42501', NULL, 'el cliente no puede insertar en settings');

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
