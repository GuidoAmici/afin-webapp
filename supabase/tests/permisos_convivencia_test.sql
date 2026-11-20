-- pgTAP: convivencia rol-permiso (M2). Un usuario con el rol del JWT y uno con
-- permisos (sin rol) operan igual; ítems sólo en pedidos pendientes; profiles
-- self-only; el catálogo anónimo sigue andando; backfill idempotente.
-- Corre con `supabase test db` (stack local). Usuarios sintéticos.

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

BEGIN;
SELECT plan(22);

-- ── Setup (superusuario) ─────────────────────────────────────────────────
-- c1 cliente · c2 cliente · em rol empleado sin asignaciones · ed pedidos:editar
-- co pedidos:corregir · uv usuarios:ver · bf1/bf2 para el backfill
INSERT INTO auth.users (id, email, raw_app_meta_data) VALUES
  ('c1c1c1c1-0000-0000-0000-000000000001', 'conv-c1@test.dev', '{}'::jsonb),
  ('c1c1c1c1-0000-0000-0000-000000000002', 'conv-c2@test.dev', '{}'::jsonb),
  ('c1c1c1c1-0000-0000-0000-000000000003', 'conv-em@test.dev', '{"role":"empleado"}'::jsonb),
  ('c1c1c1c1-0000-0000-0000-000000000004', 'conv-ed@test.dev', '{}'::jsonb),
  ('c1c1c1c1-0000-0000-0000-000000000005', 'conv-co@test.dev', '{}'::jsonb),
  ('c1c1c1c1-0000-0000-0000-000000000006', 'conv-uv@test.dev', '{}'::jsonb),
  ('c1c1c1c1-0000-0000-0000-000000000007', 'conv-bf1@test.dev', '{"role":"empleado"}'::jsonb),
  ('c1c1c1c1-0000-0000-0000-000000000008', 'conv-bf2@test.dev', '{"role":"admin"}'::jsonb);

INSERT INTO public.acceso_asignaciones (user_id, permiso) VALUES
  ('c1c1c1c1-0000-0000-0000-000000000004', 'pedidos:editar'),
  ('c1c1c1c1-0000-0000-0000-000000000005', 'pedidos:corregir'),
  ('c1c1c1c1-0000-0000-0000-000000000006', 'usuarios:ver');

UPDATE public.products SET stock_fisico = 10, stock_status = 'en_stock' WHERE id = 'bomba-15-plata';

-- o1..o4: pago en_revision (o1 empleado, o2 editar) / despachados (o3 editar, o4 corregir)
-- o5: confirmado del cliente 1 · o6: pendiente del cliente 1
INSERT INTO public.orders (id, user_id, status, payment_status) VALUES
  ('d0d0d0d0-0000-0000-0000-000000000001', 'c1c1c1c1-0000-0000-0000-000000000001', 'pendiente',  'en_revision'),
  ('d0d0d0d0-0000-0000-0000-000000000002', 'c1c1c1c1-0000-0000-0000-000000000001', 'pendiente',  'en_revision'),
  ('d0d0d0d0-0000-0000-0000-000000000003', 'c1c1c1c1-0000-0000-0000-000000000001', 'despachado', 'pagado'),
  ('d0d0d0d0-0000-0000-0000-000000000004', 'c1c1c1c1-0000-0000-0000-000000000001', 'despachado', 'pagado'),
  ('d0d0d0d0-0000-0000-0000-000000000005', 'c1c1c1c1-0000-0000-0000-000000000001', 'confirmado', 'pendiente'),
  ('d0d0d0d0-0000-0000-0000-000000000006', 'c1c1c1c1-0000-0000-0000-000000000001', 'pendiente',  'pendiente'),
  ('d0d0d0d0-0000-0000-0000-000000000007', 'c1c1c1c1-0000-0000-0000-000000000002', 'pendiente',  'pagado');
-- o7 (pagado, pendiente): compromete 3 de bomba-15-plata para el catálogo anónimo
INSERT INTO public.order_items (order_id, product_id, quantity) VALUES
  ('d0d0d0d0-0000-0000-0000-000000000007', 'bomba-15-plata', 3);

-- ── Pago confirmado por rol y por permiso ────────────────────────────────
SELECT set_config('request.jwt.claims',
  '{"sub":"c1c1c1c1-0000-0000-0000-000000000003","app_metadata":{"role":"empleado"}}', true);
SELECT lives_ok($$ SELECT public.transition_order('d0d0d0d0-0000-0000-0000-000000000001','payment_status','pagado') $$,
  'empleado por rol del JWT, sin asignaciones, confirma un pago');

SELECT set_config('request.jwt.claims',
  '{"sub":"c1c1c1c1-0000-0000-0000-000000000004","app_metadata":{}}', true);
SELECT lives_ok($$ SELECT public.transition_order('d0d0d0d0-0000-0000-0000-000000000002','payment_status','pagado') $$,
  'sin rol y con pedidos:editar confirma un pago');
SELECT throws_ok($$ SELECT public.transition_order('d0d0d0d0-0000-0000-0000-000000000003','status','cancelado') $$,
  '42501', NULL, 'pedidos:editar no puede despachado -> cancelado');

SELECT set_config('request.jwt.claims',
  '{"sub":"c1c1c1c1-0000-0000-0000-000000000005","app_metadata":{}}', true);
SELECT lives_ok($$ SELECT public.transition_order('d0d0d0d0-0000-0000-0000-000000000004','status','cancelado') $$,
  'pedidos:corregir sí puede despachado -> cancelado');

-- ── Un cliente sin rol ni permisos sigue en nivel 0 ──────────────────────
SELECT set_config('request.jwt.claims',
  '{"sub":"c1c1c1c1-0000-0000-0000-000000000001","app_metadata":{}}', true);
SELECT throws_ok($$ SELECT public.transition_order('d0d0d0d0-0000-0000-0000-000000000006','status','confirmado') $$,
  '42501', NULL, 'sin rol ni permisos: nivel 0, no confirma');

-- ── is_staff() ───────────────────────────────────────────────────────────
SELECT set_config('request.jwt.claims',
  '{"sub":"c1c1c1c1-0000-0000-0000-000000000004","app_metadata":{}}', true);
SET LOCAL ROLE authenticated;
SELECT is(public.is_staff(), false, 'is_staff: pedidos:editar solo (sin pedidos:ver) no es staff');
RESET ROLE;
INSERT INTO public.acceso_asignaciones (user_id, permiso) VALUES
  ('c1c1c1c1-0000-0000-0000-000000000004', 'pedidos:ver');
SET LOCAL ROLE authenticated;
SELECT is(public.is_staff(), true, 'is_staff: con pedidos:ver sí');
RESET ROLE;
SELECT set_config('request.jwt.claims',
  '{"sub":"c1c1c1c1-0000-0000-0000-000000000003","app_metadata":{"role":"empleado"}}', true);
SET LOCAL ROLE authenticated;
SELECT is(public.is_staff(), true, 'is_staff: el rol del JWT sigue valiendo');
RESET ROLE;
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);
SET LOCAL ROLE anon;
SELECT is(public.is_staff(), false, 'is_staff: anon false, sin error');
RESET ROLE;

-- ── Ítems sólo en pedidos pendientes ─────────────────────────────────────
-- Local no trae el default privilege de Supabase cloud (authenticated INSERT en
-- order_items); sin el grant el test pasaría por permiso de tabla y no por la policy.
GRANT INSERT, SELECT ON public.order_items TO authenticated;
GRANT SELECT ON public.orders, public.profiles TO authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"c1c1c1c1-0000-0000-0000-000000000001","app_metadata":{}}', true);
SET LOCAL ROLE authenticated;
SELECT throws_ok($$ INSERT INTO public.order_items (order_id, product_id, quantity)
  VALUES ('d0d0d0d0-0000-0000-0000-000000000005', 'bomba-15-plata', 1) $$,
  '42501', NULL, 'el cliente no inserta ítems en su pedido confirmado');
SELECT lives_ok($$ INSERT INTO public.order_items (order_id, product_id, quantity)
  VALUES ('d0d0d0d0-0000-0000-0000-000000000006', 'bomba-15-plata', 1) $$,
  'el cliente sí inserta ítems en su pedido pendiente');
RESET ROLE;

-- ── profiles self-only ───────────────────────────────────────────────────
SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*)::int FROM public.profiles WHERE id = 'c1c1c1c1-0000-0000-0000-000000000002'), 0,
  'un cliente no lee el perfil de otro');
SELECT is((SELECT count(*)::int FROM public.profiles WHERE id = 'c1c1c1c1-0000-0000-0000-000000000001'), 1,
  'un cliente lee su propio perfil');
RESET ROLE;

SELECT set_config('request.jwt.claims',
  '{"sub":"c1c1c1c1-0000-0000-0000-000000000006","app_metadata":{}}', true);
SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*)::int FROM public.profiles WHERE id = 'c1c1c1c1-0000-0000-0000-000000000002'), 1,
  'con usuarios:ver se lee el perfil de otro');
RESET ROLE;

SELECT set_config('request.jwt.claims',
  '{"sub":"c1c1c1c1-0000-0000-0000-000000000003","app_metadata":{"role":"empleado"}}', true);
SET LOCAL ROLE authenticated;
SELECT is((SELECT count(*)::int FROM public.profiles WHERE id = 'c1c1c1c1-0000-0000-0000-000000000002'), 1,
  'el rol de staff del JWT lee perfiles ajenos (convivencia)');
RESET ROLE;

-- ── Catálogo anónimo (R9) ────────────────────────────────────────────────
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);
SET LOCAL ROLE anon;
SELECT lives_ok($$ SELECT disponible FROM public.products_with_stock WHERE id = 'bomba-15-plata' $$,
  'anon lee products_with_stock');
SELECT is((SELECT disponible FROM public.products_with_stock WHERE id = 'bomba-15-plata'), 7,
  'disponible = físico (10) - comprometido (3) para anon');
SELECT throws_ok($$ SELECT public.committed_stock('bomba-15-plata') $$,
  '42501', NULL, 'anon no ejecuta committed_stock');
RESET ROLE;
SELECT is(public.committed_stock('bomba-15-plata'), 3, 'committed_stock sigue calculando para el dueño');

-- ── Backfill ─────────────────────────────────────────────────────────────
SELECT private.sincronizar_permisos_desde_roles();
SELECT results_eq($$ SELECT permiso FROM public.acceso_asignaciones
    WHERE user_id = 'c1c1c1c1-0000-0000-0000-000000000007' AND otorgado_por IS NULL ORDER BY permiso $$,
  $$ SELECT permiso FROM public.acceso_plantilla_permisos WHERE plantilla = 'encargado' ORDER BY permiso $$,
  'rol empleado -> permisos de encargado');
SELECT is((SELECT count(*)::int FROM public.acceso_asignaciones
    WHERE user_id = 'c1c1c1c1-0000-0000-0000-000000000008' AND revocado_en IS NULL),
  (SELECT count(*)::int FROM public.acceso_plantilla_permisos WHERE plantilla = 'administrador'),
  'rol admin -> permisos de administrador');
SELECT is(private.sincronizar_permisos_desde_roles(), 0, 'el backfill es idempotente');

SELECT * FROM finish();
ROLLBACK;
