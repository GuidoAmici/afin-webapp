-- pgTAP: prepare_checkout (#14). Snapshot de precios server-side + autorización.
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

BEGIN;
SELECT plan(6);

INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'c1@test.dev'),
  ('22222222-2222-2222-2222-222222222222', 'c2@test.dev');

-- Precios de prueba sobre productos existentes del catálogo.
UPDATE public.products SET price_retail = 1000 WHERE id = 'medidor';
UPDATE public.products SET price_retail = 500  WHERE id = 'varillas-rattan';
UPDATE public.products SET price_retail = NULL WHERE id = 'frasco-copa';

-- Pedido con ítems con precio (2×1000 + 1×500 = 2500).
INSERT INTO public.orders (id, user_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111');
INSERT INTO public.order_items (order_id, product_id, quantity) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'medidor', 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'varillas-rattan', 1);

-- Pedido con un producto sin precio.
INSERT INTO public.orders (id, user_id) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111');
INSERT INTO public.order_items (order_id, product_id, quantity) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'frasco-copa', 1);

-- Cliente dueño (c1)
SELECT set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","app_metadata":{"role":"cliente"}}', true);

-- 1) total calculado server-side
SELECT is(
  (public.prepare_checkout('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mercadopago')).total,
  2500::numeric, 'total = 2×1000 + 1×500 = 2500');

-- 2) payment_method persistido
SELECT is(
  (SELECT payment_method FROM public.orders WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  'mercadopago', 'payment_method seteado');

-- 3) snapshot de unit_price desde products
SELECT is(
  (SELECT unit_price FROM public.order_items
     WHERE order_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND product_id = 'medidor'),
  1000::numeric, 'unit_price tomado de products');

-- 4) medio de pago inválido
SELECT throws_ok(
  $$ SELECT public.prepare_checkout('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'efectivo') $$,
  '23514', NULL, 'medio de pago inválido rechazado');

-- 5) producto sin precio → no se puede pagar online
SELECT throws_ok(
  $$ SELECT public.prepare_checkout('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'mercadopago') $$,
  '23514', NULL, 'producto sin precio rechazado');

-- 6) un cliente ajeno no puede preparar el checkout
SELECT set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","app_metadata":{"role":"cliente"}}', true);
SELECT throws_ok(
  $$ SELECT public.prepare_checkout('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mercadopago') $$,
  '42501', NULL, 'cliente ajeno rechazado');

SELECT * FROM finish();
ROLLBACK;
