-- pgTAP: replace_order_items — reemplazo atómico de los ítems de un pedido.
-- El bug que motiva la función: el route handler hacía DELETE + INSERT en dos
-- requests, y si el INSERT fallaba el pedido quedaba vivo y vacío.
-- Corre con `supabase test db` (stack local, no toca stg/prod).

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

BEGIN;
SELECT plan(9);

-- ── Setup (como postgres) ────────────────────────────────────────────────
INSERT INTO public.categories (id, label) VALUES ('cat-test', 'Categoría Test');
INSERT INTO public.subcategories (id, category_id, label) VALUES ('sub-test', 'cat-test', 'Sub Test');

INSERT INTO public.products (id, name, category_id, subcategory_id, image, price_retail, price_wholesale) VALUES
  ('prod-a', 'Producto A', 'cat-test', 'sub-test', '/a.png', 100.00, 80.00),
  ('prod-b', 'Producto B', 'cat-test', 'sub-test', '/b.png', NULL,   50.00);

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('31313131-3131-3131-3131-313131313131', 'cliente-a@test.dev', '{"nombre":"Cliente A"}'::jsonb),
  ('32323232-3232-3232-3232-323232323232', 'cliente-b@test.dev', '{"nombre":"Cliente B"}'::jsonb);

-- Pedido pendiente del cliente A, con un ítem cargado.
INSERT INTO public.orders (id, user_id, notes) VALUES
  ('33333333-3333-3333-3333-333333333333', '31313131-3131-3131-3131-313131313131', 'notas viejas');
INSERT INTO public.order_items (order_id, product_id, quantity, unit_price) VALUES
  ('33333333-3333-3333-3333-333333333333', 'prod-a', 1, 999.00);

-- Pedido ya confirmado del mismo cliente: sus ítems no se deben poder tocar.
INSERT INTO public.orders (id, user_id, status) VALUES
  ('34343434-3434-3434-3434-343434343434', '31313131-3131-3131-3131-313131313131', 'confirmado');
INSERT INTO public.order_items (order_id, product_id, quantity, unit_price) VALUES
  ('34343434-3434-3434-3434-343434343434', 'prod-a', 7, 100.00);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders, public.order_items TO authenticated;
GRANT SELECT ON public.products TO authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- Como el cliente dueño del pedido
-- ════════════════════════════════════════════════════════════════════════
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"31313131-3131-3131-3131-313131313131","app_metadata":{"role":"cliente"}}', true);

-- 1) el reemplazo corre
SELECT lives_ok(
  $$ SELECT public.replace_order_items(
       '33333333-3333-3333-3333-333333333333',
       '[{"product_id":"prod-a","quantity":3},{"product_id":"prod-b","quantity":5}]'::jsonb,
       'notas nuevas') $$,
  'replace_order_items reemplaza los ítems de un pedido pendiente');

-- 2) quedaron exactamente los ítems nuevos, no los viejos
SELECT is(
  (SELECT count(*)::int FROM public.order_items WHERE order_id = '33333333-3333-3333-3333-333333333333'),
  2, 'el pedido queda con los dos ítems nuevos');

-- 3) el precio sale del catálogo, no del 999 que tenía la fila anterior
SELECT is(
  (SELECT unit_price FROM public.order_items
     WHERE order_id = '33333333-3333-3333-3333-333333333333' AND product_id = 'prod-a'),
  100.00::numeric, 'el precio se resuelve desde products (price_retail)');

-- 4) y cae a price_wholesale cuando no hay retail
SELECT is(
  (SELECT unit_price FROM public.order_items
     WHERE order_id = '33333333-3333-3333-3333-333333333333' AND product_id = 'prod-b'),
  50.00::numeric, 'sin price_retail toma price_wholesale');

-- 5) las cantidades son las pedidas
SELECT is(
  (SELECT quantity FROM public.order_items
     WHERE order_id = '33333333-3333-3333-3333-333333333333' AND product_id = 'prod-b'),
  5, 'respeta la cantidad pedida');

-- 6) y las notas se actualizaron en la misma operación
SELECT is(
  (SELECT notes FROM public.orders WHERE id = '33333333-3333-3333-3333-333333333333'),
  'notas nuevas', 'las notas se reemplazan junto con los ítems');

-- ════════════════════════════════════════════════════════════════════════
-- Barreras
-- ════════════════════════════════════════════════════════════════════════

-- 7) un pedido ya confirmado no se toca: el precio está snapshoteado (ADR-005)
SELECT throws_ok(
  $$ SELECT public.replace_order_items(
       '34343434-3434-3434-3434-343434343434',
       '[{"product_id":"prod-a","quantity":1}]'::jsonb, NULL) $$,
  '23514', NULL, 'rechaza reemplazar los ítems de un pedido confirmado');

-- 8) y el rechazo no dejó el pedido vacío — la excepción corta antes del DELETE.
--    Este es el corazón del bug original: fallar sin destruir lo que había.
SELECT is(
  (SELECT quantity FROM public.order_items WHERE order_id = '34343434-3434-3434-3434-343434343434'),
  7, 'el pedido confirmado conserva sus ítems tras el rechazo');

-- 9) el pedido de otro cliente no es accesible: la RLS lo esconde y la función
--    lo convierte en error explícito en vez de un no-op silencioso.
SELECT set_config('request.jwt.claims',
  '{"sub":"32323232-3232-3232-3232-323232323232","app_metadata":{"role":"cliente"}}', true);
SELECT throws_ok(
  $$ SELECT public.replace_order_items(
       '33333333-3333-3333-3333-333333333333',
       '[{"product_id":"prod-a","quantity":1}]'::jsonb, NULL) $$,
  'P0002', NULL, 'un cliente no puede reemplazar los ítems del pedido de otro');

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
