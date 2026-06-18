-- pgTAP: derivación de stock disponible (ADR-007 / issue #16)
-- Corre con `supabase test db` (stack local, no toca stg/prod).
-- Cubre: comprometido (pagados no despachados), que el impago no compromete,
-- disponible = físico − comprometido, derivación de en_stock (incl. no rastreado
-- y override de stock_status), descuento del físico SOLO al despachar (con clamp
-- en sobreventa) y el pasaje automático a en_espera_stock al pagar sin disponible.

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

BEGIN;
SELECT plan(16);

-- ── Setup ────────────────────────────────────────────────────────────────
-- cliente1 11..  cliente2 22..
INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'c1@test.dev'),
  ('22222222-2222-2222-2222-222222222222', 'c2@test.dev');

-- bomba-15-plata: 10 unidades rastreadas; bomba-20-plata: 3 (para sobreventa);
-- frasco-sampling: queda NULL = no rastreado.
UPDATE public.products SET stock_fisico = 10, stock_status = 'en_stock' WHERE id = 'bomba-15-plata';
UPDATE public.products SET stock_fisico = 3,  stock_status = 'en_stock' WHERE id = 'bomba-20-plata';

-- order_imp: impago (no compromete) · order_ok: se paga con stock ·
-- order_ovs: se paga sin stock (sobreventa)
INSERT INTO public.orders (id, user_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222');

INSERT INTO public.order_items (order_id, product_id, quantity) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bomba-15-plata', 4),  -- impago
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bomba-15-plata', 3),  -- pagará: compromete 3
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bomba-20-plata', 5);  -- pagará: sobreventa

-- ════════════════════════════════════════════════════════════════════════
-- Estado inicial: nada pagado todavía
-- ════════════════════════════════════════════════════════════════════════

-- 1) sin pagos, comprometido es 0 (un pedido impago no compromete stock)
SELECT is(public.committed_stock('bomba-15-plata'), 0,
  'sin pagos: comprometido = 0 (el impago no compromete)');

-- 2) disponible = físico cuando no hay nada comprometido
SELECT is((SELECT disponible FROM public.products_with_stock WHERE id = 'bomba-15-plata'), 10,
  'disponible inicial = físico (10)');

-- 3) producto no rastreado: disponible NULL
SELECT is((SELECT disponible FROM public.products_with_stock WHERE id = 'frasco-sampling')::int, NULL::int,
  'stock_fisico NULL ⇒ disponible NULL (no rastreado)');

-- 4) producto no rastreado: en_stock = true (siempre disponible)
SELECT is((SELECT en_stock FROM public.products_with_stock WHERE id = 'frasco-sampling'), true,
  'stock_fisico NULL ⇒ en_stock true');

-- ════════════════════════════════════════════════════════════════════════
-- Pago con stock disponible (order_ok)
-- ════════════════════════════════════════════════════════════════════════
SELECT public.transition_order_system('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'payment_status', 'pagado');

-- 5) ahora comprometido = 3 (solo el pagado; el impago de 4 sigue sin contar)
SELECT is(public.committed_stock('bomba-15-plata'), 3,
  'pagado compromete; impago no (comprometido = 3)');

-- 6) disponible = 10 − 3 = 7
SELECT is((SELECT disponible FROM public.products_with_stock WHERE id = 'bomba-15-plata'), 7,
  'disponible = físico − comprometido (7)');

-- 7) había stock: pagar no cambió el eje logístico
SELECT is((SELECT status FROM public.orders WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 'pendiente',
  'con disponible, pagar no mueve el status');

-- 8) el físico NO bajó al pagar (solo baja al despachar)
SELECT is((SELECT stock_fisico FROM public.products WHERE id = 'bomba-15-plata'), 10,
  'el físico no baja hasta despachar');

-- ════════════════════════════════════════════════════════════════════════
-- Pago sin stock disponible (order_ovs): no se bloquea, va a en_espera_stock
-- ════════════════════════════════════════════════════════════════════════
SELECT public.transition_order_system('cccccccc-cccc-cccc-cccc-cccccccccccc', 'payment_status', 'pagado');

-- 9) el pago se registró igual (no se bloqueó)
SELECT is((SELECT payment_status FROM public.orders WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), 'pagado',
  'pagar sin disponible no bloquea el pago');

-- 10) el pedido pasó a en_espera_stock
SELECT is((SELECT status FROM public.orders WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), 'en_espera_stock',
  'sin disponible al pagar ⇒ en_espera_stock');

-- 11) se auditó el evento stock:insuficiente
SELECT is(
  (SELECT count(*)::int FROM public.order_events
     WHERE order_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' AND event_type = 'stock:insuficiente'),
  1, 'el pasaje a en_espera_stock dejó un order_event stock:insuficiente');

-- ════════════════════════════════════════════════════════════════════════
-- Despacho: el físico baja acá (y solo acá)
-- ════════════════════════════════════════════════════════════════════════
SELECT public.transition_order_system('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'status', 'confirmado');
SELECT public.transition_order_system('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'status', 'en_preparacion');
SELECT public.transition_order_system('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'status', 'listo');
SELECT public.transition_order_system('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'status', 'despachado');

-- 12) físico = 10 − 3 = 7
SELECT is((SELECT stock_fisico FROM public.products WHERE id = 'bomba-15-plata'), 7,
  'al despachar el físico baja en la cantidad del pedido');

-- 13) un pedido despachado deja de comprometer (no doble conteo)
SELECT is(public.committed_stock('bomba-15-plata'), 0,
  'despachado ya no cuenta como comprometido');

-- Sobreventa: despachar cccc (5 unidades, físico 3) clampa a 0
SELECT public.transition_order_system('cccccccc-cccc-cccc-cccc-cccccccccccc', 'status', 'en_preparacion');
SELECT public.transition_order_system('cccccccc-cccc-cccc-cccc-cccccccccccc', 'status', 'listo');
SELECT public.transition_order_system('cccccccc-cccc-cccc-cccc-cccccccccccc', 'status', 'despachado');

-- 14) despacho sobrevendido clampa el físico a 0 (no viola el CHECK >= 0)
SELECT is((SELECT stock_fisico FROM public.products WHERE id = 'bomba-20-plata'), 0,
  'despacho sobrevendido clampa el físico a 0');

-- ════════════════════════════════════════════════════════════════════════
-- Derivación de en_stock en el catálogo
-- ════════════════════════════════════════════════════════════════════════

-- 15) disponible 0 ⇒ en_stock false
SELECT is((SELECT en_stock FROM public.products_with_stock WHERE id = 'bomba-20-plata'), false,
  'disponible <= 0 ⇒ en_stock false');

-- 16) stock_status no 'en_stock' manda sobre el físico
UPDATE public.products SET stock_status = 'consultar' WHERE id = 'bomba-15-plata';
SELECT is((SELECT en_stock FROM public.products_with_stock WHERE id = 'bomba-15-plata'), false,
  'stock_status consultar ⇒ en_stock false aunque haya físico');

SELECT * FROM finish();
ROLLBACK;
