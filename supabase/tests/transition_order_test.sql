-- pgTAP: suite de transition_order (ADR-006)
-- Corre con `supabase test db` (stack local, no toca stg/prod).
-- Cubre: transiciones válidas/ inválidas, autorización por rol, ownership de
-- cliente, barrera de pago (bloqueo / crédito / override admin), auditoría en
-- order_events, y que el UPDATE directo + el núcleo no son accesibles a usuarios.

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

BEGIN;
SELECT plan(19);

-- ── UUIDs fijos ──────────────────────────────────────────────────────────
-- cliente1 11..  cliente2 22..  empleado 33..  admin 44..
-- order1 aa..  order3 cc..  order_ov dd..  order_inv ee..

-- ── Setup (como postgres / superuser) ────────────────────────────────────
INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'cliente1@test.dev'),
  ('22222222-2222-2222-2222-222222222222', 'cliente2@test.dev'),
  ('33333333-3333-3333-3333-333333333333', 'empleado@test.dev'),
  ('44444444-4444-4444-4444-444444444444', 'admin@test.dev');

-- cliente2 tiene crédito habilitado (el trigger ya creó los profiles)
UPDATE public.profiles SET credito_habilitado = true
  WHERE id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.orders (id, user_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111');

-- ── Helper: setear el actor (claims del JWT) ─────────────────────────────
-- Las funciones leen auth.uid()/auth.jwt() desde request.jwt.claims.

-- ════════════════════════════════════════════════════════════════════════
-- Cliente (nivel 0)
-- ════════════════════════════════════════════════════════════════════════
SELECT set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","app_metadata":{"role":"cliente"}}', true);

-- 1) cliente no puede confirmar (rol insuficiente)
SELECT throws_ok(
  $$ SELECT public.transition_order('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','status','confirmado') $$,
  '42501', NULL, 'el cliente no debería poder confirmar su pedido');

-- 2) cliente puede pendiente→en_revision sobre su propio pedido
SELECT lives_ok(
  $$ SELECT public.transition_order('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','payment_status','en_revision') $$,
  'cliente sube comprobante: pendiente→en_revision sobre su pedido');

-- 3) y el estado de pago quedó en en_revision
SELECT is(
  (SELECT payment_status FROM public.orders WHERE id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  'en_revision', 'payment_status pasó a en_revision');

-- 4) cliente1 NO puede operar el pedido de cliente2 (ownership)
SELECT throws_ok(
  $$ SELECT public.transition_order('cccccccc-cccc-cccc-cccc-cccccccccccc','payment_status','en_revision') $$,
  '42501', NULL, 'cliente no puede operar un pedido ajeno');

-- ════════════════════════════════════════════════════════════════════════
-- Empleado (nivel 1)
-- ════════════════════════════════════════════════════════════════════════
SELECT set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","app_metadata":{"role":"empleado"}}', true);

-- 5) empleado confirma order1
SELECT lives_ok(
  $$ SELECT public.transition_order('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','status','confirmado') $$,
  'empleado confirma: pendiente→confirmado');

-- 6) barrera de pago: confirmado→en_preparacion sin pago ni crédito falla
SELECT throws_ok(
  $$ SELECT public.transition_order('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','status','en_preparacion') $$,
  '23514', NULL, 'la barrera bloquea preparar un pedido impago sin crédito');

-- 7) empleado marca el pago
SELECT lives_ok(
  $$ SELECT public.transition_order('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','payment_status','pagado') $$,
  'empleado corrobora pago: en_revision→pagado');

-- 8) ahora sí puede preparar
SELECT lives_ok(
  $$ SELECT public.transition_order('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','status','en_preparacion') $$,
  'con el pedido pagado, confirmado→en_preparacion pasa la barrera');

-- 9) el hito prepared_at quedó seteado
SELECT isnt(
  (SELECT prepared_at::text FROM public.orders WHERE id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  NULL, 'prepared_at se setea al entrar en en_preparacion');

-- 10) empleado NO puede cancelar desde en_preparacion (edge admin-only)
SELECT throws_ok(
  $$ SELECT public.transition_order('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','status','cancelado') $$,
  '42501', NULL, 'empleado no puede forzar cancelación desde en_preparacion');

-- 11) transición inválida (salto pendiente→entregado en otro pedido)
SELECT throws_ok(
  $$ SELECT public.transition_order('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','status','entregado') $$,
  '23514', NULL, 'un salto no declarado en la máquina es inválido');

-- 12) crédito: order3 es de cliente2 (credito_habilitado=true)
SELECT lives_ok(
  $$ SELECT public.transition_order('cccccccc-cccc-cccc-cccc-cccccccccccc','status','confirmado') $$,
  'empleado confirma el pedido del cliente con crédito');

-- 13) con crédito, preparar sin pago pasa la barrera
SELECT lives_ok(
  $$ SELECT public.transition_order('cccccccc-cccc-cccc-cccc-cccccccccccc','status','en_preparacion') $$,
  'credito_habilitado deja preparar sin pago');

-- ════════════════════════════════════════════════════════════════════════
-- Admin (nivel 2)
-- ════════════════════════════════════════════════════════════════════════
SELECT set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444","app_metadata":{"role":"admin"}}', true);

-- 14) admin sí puede forzar la cancelación desde en_preparacion
SELECT lives_ok(
  $$ SELECT public.transition_order('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','status','cancelado') $$,
  'admin fuerza cancelación desde en_preparacion');

-- 15) admin override de la barrera de pago (order_ov: cliente1 sin crédito, impago)
SELECT lives_ok(
  $$ SELECT public.transition_order('dddddddd-dddd-dddd-dddd-dddddddddddd','status','confirmado') $$,
  'admin confirma order_ov');
-- (este lives_ok cuenta como assertion 15)

-- 16) admin saltea la barrera al preparar sin pago
SELECT lives_ok(
  $$ SELECT public.transition_order('dddddddd-dddd-dddd-dddd-dddddddddddd','status','en_preparacion') $$,
  'admin saltea la barrera de pago (override)');

-- ════════════════════════════════════════════════════════════════════════
-- Auditoría
-- ════════════════════════════════════════════════════════════════════════
-- order1: confirmó(5) + pagó(7) + preparó(8) + canceló(14) = 4 eventos.
-- Más el en_revision del cliente (2) = 5 en total sobre order1.
SELECT is(
  (SELECT count(*)::int FROM public.order_events
     WHERE order_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  5, 'cada transición exitosa de order1 escribió una fila en order_events');

-- ════════════════════════════════════════════════════════════════════════
-- Privilegios: ni el UPDATE directo ni el núcleo son accesibles a authenticated
-- ════════════════════════════════════════════════════════════════════════
SET LOCAL ROLE authenticated;

-- 17) UPDATE directo de status rechazado por privilegio de columna
SELECT throws_ok(
  $$ UPDATE public.orders SET status='entregado'
       WHERE id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' $$,
  '42501', NULL,
  'authenticated no puede UPDATE directo de status');

-- 18) el núcleo no es invocable por authenticated
SELECT throws_ok(
  $$ SELECT public._transition_order_core(
       'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','status','confirmado',
       '11111111-1111-1111-1111-111111111111',2,'admin',true,'{}'::jsonb) $$,
  '42501', NULL,
  'authenticated no puede invocar el núcleo directamente');

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
