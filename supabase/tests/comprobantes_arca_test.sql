-- pgTAP: comprobantes de ARCA (esquema fiscal, cotizaciones y RPC de carga).
-- Corre con `supabase test db`. Datos sintéticos: el CUIT 20000000001 es inválido a
-- propósito y los importes son inventados.

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

BEGIN;
SELECT plan(44);

-- ── Setup (superusuario) ─────────────────────────────────────────────────
-- ca1: finanzas:cargar + finanzas:ver · ve1: sólo finanzas:ver · eq1: sólo equipo:acceder
INSERT INTO auth.users (id, email, raw_app_meta_data) VALUES
  ('f1f1f1f1-0000-0000-0000-000000000001', 'fin-ca1@test.dev', '{}'::jsonb),
  ('f1f1f1f1-0000-0000-0000-000000000002', 'fin-ve1@test.dev', '{}'::jsonb),
  ('f1f1f1f1-0000-0000-0000-000000000003', 'fin-eq1@test.dev', '{}'::jsonb);
INSERT INTO public.acceso_asignaciones (user_id, permiso) VALUES
  ('f1f1f1f1-0000-0000-0000-000000000001', 'finanzas:cargar'),
  ('f1f1f1f1-0000-0000-0000-000000000001', 'finanzas:ver'),
  ('f1f1f1f1-0000-0000-0000-000000000002', 'finanzas:ver'),
  ('f1f1f1f1-0000-0000-0000-000000000003', 'equipo:acceder');

-- Cotizaciones: la última es la del 11/03; el comprobante del 12/03 usa la última.
INSERT INTO public.usd_rates (date, oficial_buy, oficial_sell, blue_buy, blue_sell, mep_sell) VALUES
  ('2026-03-10', 990, 1000, 1190, 1200, 1100),
  ('2026-03-11', 1090, 1100, 1290, 1300, 1150),
  ('2026-07-03', 1190, 1200, NULL, NULL, NULL),   -- viernes
  ('2026-07-06', 1290, 1300, NULL, NULL, NULL),   -- lunes
  ('2026-08-14', 990, 1000, NULL, NULL, NULL);
INSERT INTO public.cpi_monthly (month, pct, factor) VALUES ('2026-03-01', 3.5, 1.5);

-- Archivo 1 (emitidos): una factura A y una nota de crédito A, marzo.
SELECT set_config('t.emitidos', $j${
  "file_name": "emitidos-sintetico.csv", "direction": "issued", "query_number": 1,
  "queried_at": "2026-11-14T10:00:00-03:00",
  "rows": [
    {"direction":"issued","issued_on":"2026-03-10","voucher_type":1,"point_of_sale":1,"number_from":1,"number_to":1,
     "authorization_code":"70000000000001","counterparty_doc_type":80,"counterparty_doc":"20000000002",
     "counterparty_name":"CLIENTE SINTETICO","issuer_doc":"20000000001","currency":"ARS","exchange_rate":1,
     "net_21":1000,"vat_21":210,"net_taxed":1000,"net_untaxed":0,"exempt":0,"other_taxes":50,"vat_total":210,"total":1260},
    {"direction":"issued","issued_on":"2026-03-12","voucher_type":3,"point_of_sale":1,"number_from":1,"number_to":1,
     "authorization_code":"70000000000002","counterparty_doc_type":80,"counterparty_doc":"20000000002",
     "counterparty_name":"CLIENTE SINTETICO","issuer_doc":"20000000001","currency":"ARS","exchange_rate":1,
     "net_21":100,"vat_21":21,"net_taxed":100,"net_untaxed":0,"exempt":0,"other_taxes":0,"vat_total":21,"total":121}
  ]}$j$, true);
-- Mismo archivo, con el total de la nota de crédito cambiado.
SELECT set_config('t.emitidos_v2',
  replace(current_setting('t.emitidos'), '"total":121', '"total":122'), true);
-- Archivo 2 (recibidos): una factura A en USD, abril. total = 100 USD a $1000.
SELECT set_config('t.recibidos', $j${
  "file_name": "recibidos-sintetico.csv", "direction": "received", "query_number": 2,
  "queried_at": "2026-11-14T10:05:00-03:00",
  "rows": [
    {"direction":"received","issued_on":"2026-04-05","voucher_type":1,"point_of_sale":5,"number_from":7,"number_to":7,
     "authorization_code":"70000000000003","counterparty_doc_type":80,"counterparty_doc":"20000000003",
     "counterparty_name":"PROVEEDOR SINTETICO","issuer_doc":"20000000003","currency":"USD","exchange_rate":1000,
     "net_taxed":100,"net_untaxed":0,"exempt":0,"other_taxes":0,"vat_total":0,"total":100}
  ]}$j$, true);
-- Archivo 4 (emitidos): exportación en USD y NC E en USD (junio), exportación en pesos
-- (agosto), y facturas en fechas sin cotización exacta.
SELECT set_config('t.externos', $j${
  "file_name": "externos.csv", "direction": "issued", "query_number": 4,
  "queried_at": "2026-11-14T10:15:00-03:00",
  "rows": [
    {"direction":"issued","issued_on":"2026-06-10","voucher_type":19,"point_of_sale":3,"number_from":1,
     "issuer_doc":"20000000001","currency":"USD","exchange_rate":1000,"total":100},
    {"direction":"issued","issued_on":"2026-06-12","voucher_type":21,"point_of_sale":3,"number_from":1,
     "issuer_doc":"20000000001","currency":"USD","exchange_rate":1000,"total":30},
    {"direction":"issued","issued_on":"2026-08-14","voucher_type":19,"point_of_sale":3,"number_from":2,
     "issuer_doc":"20000000001","currency":"ARS","exchange_rate":1,"total":200000},
    {"direction":"issued","issued_on":"2026-07-04","voucher_type":1,"point_of_sale":4,"number_from":1,
     "issuer_doc":"20000000001","currency":"ARS","exchange_rate":1,"net_taxed":100,"total":121},
    {"direction":"issued","issued_on":"2026-09-01","voucher_type":1,"point_of_sale":4,"number_from":2,
     "issuer_doc":"20000000001","currency":"ARS","exchange_rate":1,"net_taxed":100,"total":121},
    {"direction":"issued","issued_on":"2026-02-01","voucher_type":1,"point_of_sale":4,"number_from":3,
     "issuer_doc":"20000000001","currency":"ARS","exchange_rate":1,"net_taxed":100,"total":121}
  ]}$j$, true);
-- Archivo con un tipo de comprobante inexistente: una fila buena y una con 999.
SELECT set_config('t.tipo_malo', $j${
  "file_name": "malo.csv", "direction": "issued", "query_number": 3,
  "queried_at": "2026-11-14T10:10:00-03:00",
  "rows": [
    {"direction":"issued","issued_on":"2026-05-01","voucher_type":1,"point_of_sale":2,"number_from":1,"number_to":1,
     "counterparty_doc":"20000000002","issuer_doc":"20000000001","currency":"ARS","exchange_rate":1,
     "net_taxed":10,"total":10},
    {"direction":"issued","issued_on":"2026-05-02","voucher_type":999,"point_of_sale":2,"number_from":2,"number_to":2,
     "counterparty_doc":"20000000002","issuer_doc":"20000000001","currency":"ARS","exchange_rate":1,
     "net_taxed":10,"total":10}
  ]}$j$, true);

-- ── Catálogo de tipos ────────────────────────────────────────────────────
SELECT is((SELECT count(*)::int FROM public.fiscal_voucher_types), 19, 'el catálogo trae los 19 tipos');
SELECT results_eq(
  $$ SELECT code::int FROM public.fiscal_voucher_types WHERE sign = -1 ORDER BY code $$,
  $$ VALUES (3), (8), (13), (21), (53) $$, 'las notas de crédito restan');
SELECT results_eq(
  $$ SELECT code::int FROM public.fiscal_voucher_types WHERE market = 'foreign' ORDER BY code $$,
  $$ VALUES (19), (20), (21) $$, 'los tipos E son mercado externo');

-- ── Permisos de la carga ─────────────────────────────────────────────────
SELECT set_config('request.jwt.claims',
  '{"sub":"f1f1f1f1-0000-0000-0000-000000000002","app_metadata":{}}', true);
SET LOCAL ROLE authenticated;
SELECT throws_ok($$ SELECT public.cargar_comprobantes_arca(current_setting('t.emitidos')::jsonb) $$,
  'sin permiso', 'sin finanzas:cargar la carga falla');
SELECT throws_ok($$ INSERT INTO public.import_declarations (number, registered_on, fob_usd, cif_usd)
  VALUES ('SINT-0', '2026-03-01', 1, 1) $$, '42501', NULL, 'sin finanzas:cargar no inserta despachos');
RESET ROLE;
SET LOCAL ROLE anon;
SELECT throws_ok($$ SELECT public.cargar_comprobantes_arca('{}'::jsonb) $$, '42501', NULL,
  'anon no ejecuta la carga');
SELECT throws_ok($$ SELECT count(*) FROM public.fiscal_vouchers $$, '42501', NULL,
  'anon no lee fiscal_vouchers');
RESET ROLE;

-- ── Carga e idempotencia ─────────────────────────────────────────────────
SELECT set_config('request.jwt.claims',
  '{"sub":"f1f1f1f1-0000-0000-0000-000000000001","app_metadata":{}}', true);
SET LOCAL ROLE authenticated;
SELECT set_config('t.r1', public.cargar_comprobantes_arca(current_setting('t.emitidos')::jsonb)::text, true);
SELECT is(current_setting('t.r1')::jsonb->>'rows_new', '2', 'primera carga: 2 filas nuevas');
SELECT is(current_setting('t.r1')::jsonb->>'rows_updated', '0', 'primera carga: 0 actualizadas');
SELECT is(current_setting('t.r1')::jsonb->>'date_from', '2026-03-10', 'date_from');
SELECT is(current_setting('t.r1')::jsonb->>'date_to', '2026-03-12', 'date_to');
SELECT set_config('t.r2', public.cargar_comprobantes_arca(current_setting('t.emitidos')::jsonb)::text, true);
SELECT is(current_setting('t.r2')::jsonb->>'rows_new', '0', 'segunda carga idéntica: 0 nuevas');
SELECT is(current_setting('t.r2')::jsonb->>'rows_updated', '0', 'segunda carga idéntica: 0 actualizadas');
SELECT is((SELECT count(*)::int FROM public.fiscal_vouchers), 2, 'no se duplicó ninguna fila');
SELECT set_config('t.r3', public.cargar_comprobantes_arca(current_setting('t.emitidos_v2')::jsonb)::text, true);
SELECT is(current_setting('t.r3')::jsonb->>'rows_new', '0', 'archivo superpuesto: 0 nuevas');
SELECT is(current_setting('t.r3')::jsonb->>'rows_updated', '1', 'cambiar un total: 1 actualizada');
SELECT is((SELECT total FROM public.fiscal_vouchers WHERE issued_on = '2026-03-12'), 122::numeric,
  'el valor nuevo quedó guardado');
SELECT is((SELECT count(*)::int FROM public.fiscal_voucher_imports), 3, 'una importación por archivo cargado');
SELECT is((SELECT loaded_by FROM public.fiscal_voucher_imports LIMIT 1),
  'f1f1f1f1-0000-0000-0000-000000000001'::uuid, 'la importación registra quién cargó');

-- Un tipo inexistente tira abajo el archivo entero.
SELECT throws_ok($$ SELECT public.cargar_comprobantes_arca(current_setting('t.tipo_malo')::jsonb) $$,
  '23503', NULL, 'un tipo 999 hace fallar la carga');
SELECT is((SELECT count(*)::int FROM public.fiscal_vouchers), 2, 'la carga fallida no dejó filas');
SELECT is((SELECT count(*)::int FROM public.fiscal_voucher_imports), 3, 'ni importación');

-- Recibidos en USD: total_ars = total x tipo de cambio.
SELECT lives_ok($$ SELECT public.cargar_comprobantes_arca(current_setting('t.recibidos')::jsonb) $$,
  'carga de recibidos');
SELECT is((SELECT total_ars FROM public.fiscal_vouchers WHERE direction = 'received'), 100000::numeric,
  'USD 100 a 1000 da total_ars = 100000');

-- Despacho de importación: CIF 500 en marzo.
SELECT lives_ok($$ INSERT INTO public.import_declarations (number, registered_on, fob_usd, cif_usd)
  VALUES ('SINT-1', '2026-03-15', 450, 500) $$, 'finanzas:cargar inserta despachos');
SELECT lives_ok($$ SELECT public.cargar_comprobantes_arca(current_setting('t.externos')::jsonb) $$,
  'carga de exportaciones y fechas sin cotización exacta');
RESET ROLE;

-- ── Formulario 3064-7 (con finanzas:ver) ─────────────────────────────────
SELECT set_config('request.jwt.claims',
  '{"sub":"f1f1f1f1-0000-0000-0000-000000000002","app_metadata":{}}', true);
SET LOCAL ROLE authenticated;
SELECT is((SELECT sales_local_ars FROM public.form_3064_monthly WHERE month = '2026-03-01'), 900::numeric,
  'factura 1000 - NC 100 netas = 900; IVA y percepciones no entran');
SELECT is((SELECT purchases_foreign_usd FROM public.form_3064_monthly WHERE month = '2026-03-01'), 500::numeric,
  'un despacho de CIF 500 en marzo da purchases_foreign_usd = 500');
SELECT is((SELECT purchases_local_ars FROM public.form_3064_monthly WHERE month = '2026-04-01'), 100000::numeric,
  'compra local en USD pasa a pesos con el tipo de cambio de ARCA');
SELECT is((SELECT has_issued FROM public.form_3064_monthly WHERE month = '2026-04-01'), false,
  'abril no tiene emitidos: has_issued = false');
SELECT is((SELECT has_received FROM public.form_3064_monthly WHERE month = '2026-04-01'), true,
  'abril tiene recibidos: has_received = true');
SELECT is((SELECT has_received FROM public.form_3064_monthly WHERE month = '2026-03-01'), false,
  'marzo no tiene recibidos: has_received = false');
SELECT is((SELECT has_issued FROM public.form_3064_monthly WHERE month = '2026-03-01'), true,
  'marzo tiene emitidos: has_issued = true');

-- ── Vista con factores de conversión ─────────────────────────────────────
SELECT is((SELECT signed_total_ars FROM public.fiscal_vouchers_v WHERE issued_on = '2026-03-12'), -122::numeric,
  'la nota de crédito resta en signed_total_ars');
SELECT is((SELECT f_usd_oficial FROM public.fiscal_vouchers_v WHERE issued_on = '2026-03-10'),
  (1::numeric / 1000), 'f_usd_oficial usa la venta del día');
SELECT is((SELECT f_usd_oficial FROM public.fiscal_vouchers_v WHERE issued_on = '2026-03-12'),
  (1::numeric / 1100), 'una fecha posterior a la última cotización usa la última');
SELECT is((SELECT f_real FROM public.fiscal_vouchers_v WHERE issued_on = '2026-03-12'), 1.5::numeric,
  'f_real es el factor del IPC del mes');
SELECT is((SELECT sales_foreign_usd FROM public.form_3064_monthly WHERE month = '2026-06-01'), 70::numeric,
  'exportación USD 100 menos NC E USD 30 = 70 en sales_foreign_usd');
SELECT is((SELECT sales_foreign_usd FROM public.form_3064_monthly WHERE month = '2026-08-01'), 200::numeric,
  'exportación en pesos 200000 con oficial 1000 suma 200 U$S');
SELECT is((SELECT f_usd_oficial FROM public.fiscal_vouchers_v WHERE issued_on = '2026-07-04'),
  (1::numeric / 1200), 'un sábado usa la cotización del viernes, no la última');
SELECT is((SELECT f_usd_oficial FROM public.fiscal_vouchers_v WHERE issued_on = '2026-09-01'),
  (1::numeric / 1000), 'posterior a la última cotización usa la última');
SELECT is((SELECT f_usd_oficial FROM public.fiscal_vouchers_v WHERE issued_on = '2026-02-01'),
  (1::numeric / 1000), 'anterior a la primera cotización usa la primera disponible');
RESET ROLE;

-- ── Sin finanzas:ver no se lee nada ──────────────────────────────────────
SELECT set_config('request.jwt.claims',
  '{"sub":"f1f1f1f1-0000-0000-0000-000000000003","app_metadata":{}}', true);
SET LOCAL ROLE authenticated;
SELECT is((SELECT (SELECT count(*) FROM public.fiscal_vouchers)
                + (SELECT count(*) FROM public.fiscal_voucher_imports)
                + (SELECT count(*) FROM public.import_declarations))::int, 0,
  'equipo:acceder sin finanzas:ver: 0 filas en las tres tablas');
SELECT is((SELECT (SELECT count(*) FROM public.fiscal_vouchers_v)
                + (SELECT count(*) FROM public.form_3064_monthly))::int, 0,
  'equipo:acceder sin finanzas:ver: 0 filas en las dos vistas');
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
