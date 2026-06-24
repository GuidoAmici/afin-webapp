-- pgTAP: endurecimiento de seguridad (#22 estado inicial del INSERT de pedidos,
-- #23 trigger functions: search_path + EXECUTE revocado).
-- Corre con `supabase test db` (stack local, no toca stg/prod).

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

BEGIN;
SELECT plan(7);

-- ── Setup (como postgres) ────────────────────────────────────────────────
-- El alta en auth.users dispara handle_new_user, que crea el profile.
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('15151515-1515-1515-1515-151515151515', 'cliente-harden@test.dev',
   '{"nombre":"Cliente Test","empresa":"AFIN QA"}'::jsonb);

-- ════════════════════════════════════════════════════════════════════════
-- #23 — trigger functions
-- ════════════════════════════════════════════════════════════════════════

-- 1) handle_new_user creó el profile con el nombre del metadata
SELECT is(
  (SELECT nombre FROM public.profiles WHERE id='15151515-1515-1515-1515-151515151515'),
  'Cliente Test', 'handle_new_user crea el profile con search_path fijo y public.profiles calificado');

-- 2) y copió la empresa
SELECT is(
  (SELECT empresa FROM public.profiles WHERE id='15151515-1515-1515-1515-151515151515'),
  'AFIN QA', 'handle_new_user copia empresa desde raw_user_meta_data');

-- 3) set_updated_at sobrescribe updated_at en cualquier UPDATE.
--    (now() es constante dentro de la tx; seteamos una fecha vieja a mano y
--     verificamos que el trigger BEFORE UPDATE la pisa con now().)
UPDATE public.profiles SET updated_at = '1999-01-01 00:00:00+00'
  WHERE id='15151515-1515-1515-1515-151515151515';
SELECT is(
  (SELECT updated_at FROM public.profiles WHERE id='15151515-1515-1515-1515-151515151515'),
  now(), 'set_updated_at pisa updated_at con now() en el UPDATE');

-- ════════════════════════════════════════════════════════════════════════
-- #22 — estado inicial del INSERT (como cliente autenticado)
-- ════════════════════════════════════════════════════════════════════════
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"15151515-1515-1515-1515-151515151515","app_metadata":{"role":"cliente"}}', true);

-- 4) el cliente puede crear su pedido con los defaults
SELECT lives_ok(
  $$ INSERT INTO public.orders (id, user_id, notes)
       VALUES ('16161616-1616-1616-1616-161616161616',
               '15151515-1515-1515-1515-151515151515', 'ok') $$,
  'cliente crea pedido tomando los defaults');

-- 5) y nace en pendiente/pendiente
SELECT is(
  (SELECT status || '/' || payment_status FROM public.orders
     WHERE id='16161616-1616-1616-1616-161616161616'),
  'pendiente/pendiente', 'el pedido del cliente nace en pendiente/pendiente');

-- 6) no puede inyectar un status avanzado en el INSERT
SELECT throws_ok(
  $$ INSERT INTO public.orders (user_id, status)
       VALUES ('15151515-1515-1515-1515-151515151515', 'entregado') $$,
  '42501', NULL, 'el cliente no puede crear un pedido con status inyectado');

-- 7) ni un payment_status pagado
SELECT throws_ok(
  $$ INSERT INTO public.orders (user_id, payment_status)
       VALUES ('15151515-1515-1515-1515-151515151515', 'pagado') $$,
  '42501', NULL, 'el cliente no puede crear un pedido con payment_status inyectado');

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
