-- Comprobantes de ARCA («Mis Comprobantes»), despachos de importación, cotizaciones y la
-- RPC de carga. Expand-only: sólo objetos nuevos.
--
-- Los importes se guardan en la moneda del comprobante, tal como vienen; los pesos son
-- total × exchange_rate. Las tablas se escriben sólo por la RPC (fiscal_*) o con
-- finanzas:cargar (import_declarations). Todas las políticas son TO authenticated: anon no
-- tiene USAGE sobre el schema private.

-- ── Catálogo de tipos de comprobante ─────────────────────────────────────────
CREATE TABLE public.fiscal_voucher_types (
    code   smallint PRIMARY KEY,
    name   text NOT NULL,
    letter text,
    sign   smallint NOT NULL CHECK (sign IN (-1, 1)),
    market text NOT NULL CHECK (market IN ('local', 'foreign'))
);

INSERT INTO public.fiscal_voucher_types (code, name, letter, sign, market) VALUES
    (1,  'Factura A',                                              'A', 1,  'local'),
    (2,  'Nota de Débito A',                                       'A', 1,  'local'),
    (3,  'Nota de Crédito A',                                      'A', -1, 'local'),
    (6,  'Factura B',                                              'B', 1,  'local'),
    (7,  'Nota de Débito B',                                       'B', 1,  'local'),
    (8,  'Nota de Crédito B',                                      'B', -1, 'local'),
    (11, 'Factura C',                                              'C', 1,  'local'),
    (12, 'Nota de Débito C',                                       'C', 1,  'local'),
    (13, 'Nota de Crédito C',                                      'C', -1, 'local'),
    (15, 'Recibo C',                                               'C', 1,  'local'),
    (17, 'Liquidación de Servicios Públicos Clase A',              'A', 1,  'local'),
    (19, 'Factura de Exportación E',                               'E', 1,  'foreign'),
    (20, 'Nota de Débito por Operaciones con el Exterior E',       'E', 1,  'foreign'),
    (21, 'Nota de Crédito por Operaciones con el Exterior E',      'E', -1, 'foreign'),
    (51, 'Factura M',                                              'M', 1,  'local'),
    (52, 'Nota de Débito M',                                       'M', 1,  'local'),
    (53, 'Nota de Crédito M',                                      'M', -1, 'local'),
    (63, 'Liquidación A',                                          'A', 1,  'local'),
    (81, 'Tique Factura A',                                        'A', 1,  'local');

-- ── Archivos cargados ────────────────────────────────────────────────────────
CREATE TABLE public.fiscal_voucher_imports (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name    text,
    direction    text NOT NULL CHECK (direction IN ('issued', 'received')),
    query_number bigint,
    queried_at   timestamptz,
    loaded_at    timestamptz NOT NULL DEFAULT now(),
    loaded_by    uuid DEFAULT auth.uid(),
    rows_new     int NOT NULL DEFAULT 0,
    rows_updated int NOT NULL DEFAULT 0,
    date_from    date,
    date_to      date
);

-- ── Comprobantes ─────────────────────────────────────────────────────────────
CREATE TABLE public.fiscal_vouchers (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    direction             text NOT NULL CHECK (direction IN ('issued', 'received')),
    issued_on             date NOT NULL,
    voucher_type          smallint NOT NULL REFERENCES public.fiscal_voucher_types (code),
    point_of_sale         int NOT NULL,
    number_from           bigint NOT NULL,
    number_to             bigint,
    authorization_code    text,
    counterparty_doc_type smallint,
    counterparty_doc      text,
    counterparty_name     text,
    issuer_doc            text NOT NULL,
    currency              text NOT NULL CHECK (currency IN ('ARS', 'USD')),
    exchange_rate         numeric NOT NULL DEFAULT 1,
    net_0                 numeric NOT NULL DEFAULT 0,
    net_2_5               numeric NOT NULL DEFAULT 0,
    vat_2_5               numeric NOT NULL DEFAULT 0,
    net_5                 numeric NOT NULL DEFAULT 0,
    vat_5                 numeric NOT NULL DEFAULT 0,
    net_10_5              numeric NOT NULL DEFAULT 0,
    vat_10_5              numeric NOT NULL DEFAULT 0,
    net_21                numeric NOT NULL DEFAULT 0,
    vat_21                numeric NOT NULL DEFAULT 0,
    net_27                numeric NOT NULL DEFAULT 0,
    vat_27                numeric NOT NULL DEFAULT 0,
    net_taxed             numeric NOT NULL DEFAULT 0,
    net_untaxed           numeric NOT NULL DEFAULT 0,
    exempt                numeric NOT NULL DEFAULT 0,
    other_taxes           numeric NOT NULL DEFAULT 0,
    vat_total             numeric NOT NULL DEFAULT 0,
    total                 numeric NOT NULL DEFAULT 0,
    total_ars             numeric GENERATED ALWAYS AS (total * exchange_rate) STORED,
    import_id             uuid REFERENCES public.fiscal_voucher_imports (id),
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now(),
    UNIQUE (direction, voucher_type, point_of_sale, number_from, issuer_doc)
);
CREATE INDEX fiscal_vouchers_issued_on_idx ON public.fiscal_vouchers (issued_on);
CREATE INDEX fiscal_vouchers_import_id_idx ON public.fiscal_vouchers (import_id);
CREATE TRIGGER fiscal_vouchers_updated_at
    BEFORE UPDATE ON public.fiscal_vouchers
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Despachos de importación ─────────────────────────────────────────────────
CREATE TABLE public.import_declarations (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    number        text NOT NULL UNIQUE,
    registered_on date NOT NULL,
    fob_usd       numeric NOT NULL,
    cif_usd       numeric NOT NULL,
    note          text,
    created_by    uuid DEFAULT auth.uid(),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz
);
CREATE TRIGGER import_declarations_updated_at
    BEFORE UPDATE ON public.import_declarations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Cotizaciones e inflación (datos públicos) ────────────────────────────────
-- usd_rates: columnas de New Haze.
CREATE TABLE public.usd_rates (
    date         date PRIMARY KEY,
    oficial_buy  numeric(10,2),
    oficial_sell numeric(10,2),
    blue_buy     numeric(10,2),
    blue_sell    numeric(10,2),
    mep_sell     numeric(10,2)
);
-- factor lleva un importe de ese mes a pesos del último mes publicado.
CREATE TABLE public.cpi_monthly (
    month  date PRIMARY KEY,
    pct    numeric NOT NULL,
    factor numeric NOT NULL
);

-- ── RLS y grants ─────────────────────────────────────────────────────────────
ALTER TABLE public.fiscal_voucher_types   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_voucher_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_vouchers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_declarations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usd_rates              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_monthly            ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.fiscal_voucher_types, public.fiscal_voucher_imports,
              public.fiscal_vouchers, public.import_declarations,
              public.usd_rates, public.cpi_monthly
    FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.fiscal_voucher_types, public.fiscal_voucher_imports,
                public.fiscal_vouchers, public.usd_rates, public.cpi_monthly
    TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.import_declarations TO authenticated;

CREATE POLICY fiscal_voucher_types_select ON public.fiscal_voucher_types
    FOR SELECT TO authenticated USING (true);
CREATE POLICY usd_rates_select ON public.usd_rates
    FOR SELECT TO authenticated USING (true);
CREATE POLICY cpi_monthly_select ON public.cpi_monthly
    FOR SELECT TO authenticated USING (true);

CREATE POLICY fiscal_vouchers_select ON public.fiscal_vouchers
    FOR SELECT TO authenticated USING ((SELECT private.tiene_permiso('finanzas:ver')));
CREATE POLICY fiscal_voucher_imports_select ON public.fiscal_voucher_imports
    FOR SELECT TO authenticated USING ((SELECT private.tiene_permiso('finanzas:ver')));
CREATE POLICY import_declarations_select ON public.import_declarations
    FOR SELECT TO authenticated USING ((SELECT private.tiene_permiso('finanzas:ver')));
CREATE POLICY import_declarations_insert ON public.import_declarations
    FOR INSERT TO authenticated WITH CHECK ((SELECT private.tiene_permiso('finanzas:cargar')));
CREATE POLICY import_declarations_update ON public.import_declarations
    FOR UPDATE TO authenticated
    USING ((SELECT private.tiene_permiso('finanzas:cargar')))
    WITH CHECK ((SELECT private.tiene_permiso('finanzas:cargar')));

-- ── Vistas ───────────────────────────────────────────────────────────────────
-- Un comprobante por fila, con los factores de conversión de su fecha (misma regla que
-- invoices_v del panel): importe en pesos × f_real queda en pesos de hoy; × f_usd_*, en
-- dólares del día. Se usan los *_sell. Cada factor toma la última cotización con valor en o
-- antes de la fecha (un sábado usa la del viernes); si no hay ninguna anterior, la primera
-- disponible. Una fecha posterior a la última cotización usa la última.
CREATE VIEW public.fiscal_vouchers_v WITH (security_invoker = on) AS
SELECT v.*,
       t.sign,
       t.market,
       v.total_ars * t.sign AS signed_total_ars,
       coalesce(c.factor, 1) AS f_real,
       1 / coalesce(
           (SELECT r.oficial_sell FROM public.usd_rates r
             WHERE r.date <= v.issued_on AND r.oficial_sell IS NOT NULL ORDER BY r.date DESC LIMIT 1),
           (SELECT r.oficial_sell FROM public.usd_rates r
             WHERE r.oficial_sell IS NOT NULL ORDER BY r.date ASC LIMIT 1)) AS f_usd_oficial,
       1 / coalesce(
           (SELECT r.blue_sell FROM public.usd_rates r
             WHERE r.date <= v.issued_on AND r.blue_sell IS NOT NULL ORDER BY r.date DESC LIMIT 1),
           (SELECT r.blue_sell FROM public.usd_rates r
             WHERE r.blue_sell IS NOT NULL ORDER BY r.date ASC LIMIT 1)) AS f_usd_blue,
       1 / coalesce(
           (SELECT r.mep_sell FROM public.usd_rates r
             WHERE r.date <= v.issued_on AND r.mep_sell IS NOT NULL ORDER BY r.date DESC LIMIT 1),
           (SELECT r.mep_sell FROM public.usd_rates r
             WHERE r.mep_sell IS NOT NULL ORDER BY r.date ASC LIMIT 1)) AS f_usd_mep
FROM public.fiscal_vouchers v
JOIN public.fiscal_voucher_types t ON t.code = v.voucher_type
LEFT JOIN public.cpi_monthly c ON c.month = date_trunc('month', v.issued_on)::date;

-- Formulario 3064-7: sin IVA ni otros tributos, local en $ y externo en U$S.
CREATE VIEW public.form_3064_monthly WITH (security_invoker = on) AS
WITH v AS (
    SELECT date_trunc('month', f.issued_on)::date AS month,
           coalesce(sum((f.net_taxed + f.net_untaxed + f.exempt) * f.exchange_rate * f.sign)
                    FILTER (WHERE f.direction = 'issued' AND f.market = 'local'), 0)   AS sales_local_ars,
           -- Externo en U$S: un comprobante en USD va por su total; uno en pesos, a dólares
           -- oficiales del día (el tipo de cambio de ARCA para un comprobante en pesos es 1).
           coalesce(sum(CASE WHEN f.currency = 'USD' THEN f.total
                             ELSE f.total_ars * f.f_usd_oficial END * f.sign)
                    FILTER (WHERE f.direction = 'issued' AND f.market = 'foreign'), 0) AS sales_foreign_usd,
           coalesce(sum((f.net_taxed + f.net_untaxed + f.exempt) * f.exchange_rate * f.sign)
                    FILTER (WHERE f.direction = 'received' AND f.market = 'local'), 0) AS purchases_local_ars,
           bool_or(f.direction = 'issued')   AS has_issued,
           bool_or(f.direction = 'received') AS has_received
    FROM public.fiscal_vouchers_v f
    GROUP BY 1
), d AS (
    SELECT date_trunc('month', registered_on)::date AS month, sum(cif_usd) AS purchases_foreign_usd
    FROM public.import_declarations
    GROUP BY 1
)
SELECT coalesce(v.month, d.month)                 AS month,
       coalesce(v.sales_local_ars, 0)             AS sales_local_ars,
       coalesce(v.sales_foreign_usd, 0)           AS sales_foreign_usd,
       coalesce(v.purchases_local_ars, 0)         AS purchases_local_ars,
       coalesce(d.purchases_foreign_usd, 0)       AS purchases_foreign_usd,
       coalesce(v.has_issued, false)              AS has_issued,
       coalesce(v.has_received, false)            AS has_received
FROM v FULL JOIN d ON d.month = v.month;

REVOKE ALL ON public.fiscal_vouchers_v, public.form_3064_monthly FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.fiscal_vouchers_v, public.form_3064_monthly TO authenticated;

-- ── RPC de carga ─────────────────────────────────────────────────────────────
-- archivo = {file_name, direction, query_number, queried_at, rows: [...]}. Una sola
-- transacción: un tipo desconocido (FK) o cualquier error deja todo como estaba.
CREATE FUNCTION public.cargar_comprobantes_arca(archivo jsonb) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_import_id uuid;
    v_new       int;
    v_updated   int;
    v_from      date;
    v_to        date;
    v_direction text := archivo->>'direction';
BEGIN
    IF NOT coalesce(private.tiene_permiso('finanzas:cargar'), false) THEN
        RAISE EXCEPTION 'sin permiso' USING ERRCODE = '42501';
    END IF;
    IF v_direction IS NULL OR v_direction NOT IN ('issued', 'received') THEN
        RAISE EXCEPTION 'dirección inválida' USING ERRCODE = '22023';
    END IF;
    IF jsonb_typeof(archivo->'rows') IS DISTINCT FROM 'array'
       OR jsonb_array_length(archivo->'rows') = 0 THEN
        RAISE EXCEPTION 'el archivo no trae filas' USING ERRCODE = '22023';
    END IF;

    IF EXISTS (SELECT 1 FROM jsonb_to_recordset(archivo->'rows') AS r(direction text)
               WHERE r.direction IS DISTINCT FROM v_direction) THEN
        RAISE EXCEPTION 'una fila no es de la dirección del archivo' USING ERRCODE = '22023';
    END IF;

    SELECT min(r.issued_on), max(r.issued_on) INTO v_from, v_to
    FROM jsonb_to_recordset(archivo->'rows') AS r(issued_on date);

    INSERT INTO public.fiscal_voucher_imports
        (file_name, direction, query_number, queried_at, date_from, date_to)
    VALUES (archivo->>'file_name', v_direction, (archivo->>'query_number')::bigint,
            (archivo->>'queried_at')::timestamptz, v_from, v_to)
    RETURNING id INTO v_import_id;

    WITH src AS (
        SELECT * FROM jsonb_to_recordset(archivo->'rows') AS r(
        direction text, issued_on date, voucher_type smallint, point_of_sale int,
        number_from bigint, number_to bigint, authorization_code text,
        counterparty_doc_type smallint, counterparty_doc text, counterparty_name text,
        issuer_doc text, currency text, exchange_rate numeric,
        net_0 numeric, net_2_5 numeric, vat_2_5 numeric, net_5 numeric, vat_5 numeric,
        net_10_5 numeric, vat_10_5 numeric, net_21 numeric, vat_21 numeric,
        net_27 numeric, vat_27 numeric, net_taxed numeric, net_untaxed numeric,
        exempt numeric, other_taxes numeric, vat_total numeric, total numeric)
    ), up AS (
        INSERT INTO public.fiscal_vouchers AS fv (
            direction, issued_on, voucher_type, point_of_sale, number_from, number_to,
            authorization_code, counterparty_doc_type, counterparty_doc, counterparty_name,
            issuer_doc, currency, exchange_rate,
            net_0, net_2_5, vat_2_5, net_5, vat_5, net_10_5, vat_10_5, net_21, vat_21,
            net_27, vat_27, net_taxed, net_untaxed, exempt, other_taxes, vat_total, total,
            import_id)
        SELECT direction, issued_on, voucher_type, point_of_sale, number_from, number_to,
               authorization_code, counterparty_doc_type, counterparty_doc, counterparty_name,
               issuer_doc, currency, coalesce(exchange_rate, 1),
               coalesce(net_0, 0), coalesce(net_2_5, 0), coalesce(vat_2_5, 0),
               coalesce(net_5, 0), coalesce(vat_5, 0), coalesce(net_10_5, 0),
               coalesce(vat_10_5, 0), coalesce(net_21, 0), coalesce(vat_21, 0),
               coalesce(net_27, 0), coalesce(vat_27, 0), coalesce(net_taxed, 0),
               coalesce(net_untaxed, 0), coalesce(exempt, 0), coalesce(other_taxes, 0),
               coalesce(vat_total, 0), coalesce(total, 0), v_import_id
        FROM src
        ON CONFLICT (direction, voucher_type, point_of_sale, number_from, issuer_doc)
        DO UPDATE SET
            issued_on = EXCLUDED.issued_on, number_to = EXCLUDED.number_to,
            authorization_code = EXCLUDED.authorization_code,
            counterparty_doc_type = EXCLUDED.counterparty_doc_type,
            counterparty_doc = EXCLUDED.counterparty_doc,
            counterparty_name = EXCLUDED.counterparty_name,
            currency = EXCLUDED.currency, exchange_rate = EXCLUDED.exchange_rate,
            net_0 = EXCLUDED.net_0, net_2_5 = EXCLUDED.net_2_5, vat_2_5 = EXCLUDED.vat_2_5,
            net_5 = EXCLUDED.net_5, vat_5 = EXCLUDED.vat_5,
            net_10_5 = EXCLUDED.net_10_5, vat_10_5 = EXCLUDED.vat_10_5,
            net_21 = EXCLUDED.net_21, vat_21 = EXCLUDED.vat_21,
            net_27 = EXCLUDED.net_27, vat_27 = EXCLUDED.vat_27,
            net_taxed = EXCLUDED.net_taxed, net_untaxed = EXCLUDED.net_untaxed,
            exempt = EXCLUDED.exempt, other_taxes = EXCLUDED.other_taxes,
            vat_total = EXCLUDED.vat_total, total = EXCLUDED.total,
            import_id = EXCLUDED.import_id
        WHERE (fv.issued_on, fv.number_to, fv.authorization_code, fv.counterparty_doc_type,
               fv.counterparty_doc, fv.counterparty_name, fv.currency, fv.exchange_rate,
               fv.net_0, fv.net_2_5, fv.vat_2_5, fv.net_5, fv.vat_5, fv.net_10_5, fv.vat_10_5,
               fv.net_21, fv.vat_21, fv.net_27, fv.vat_27, fv.net_taxed, fv.net_untaxed,
               fv.exempt, fv.other_taxes, fv.vat_total, fv.total)
              IS DISTINCT FROM
              (EXCLUDED.issued_on, EXCLUDED.number_to, EXCLUDED.authorization_code,
               EXCLUDED.counterparty_doc_type, EXCLUDED.counterparty_doc,
               EXCLUDED.counterparty_name, EXCLUDED.currency, EXCLUDED.exchange_rate,
               EXCLUDED.net_0, EXCLUDED.net_2_5, EXCLUDED.vat_2_5, EXCLUDED.net_5,
               EXCLUDED.vat_5, EXCLUDED.net_10_5, EXCLUDED.vat_10_5, EXCLUDED.net_21,
               EXCLUDED.vat_21, EXCLUDED.net_27, EXCLUDED.vat_27, EXCLUDED.net_taxed,
               EXCLUDED.net_untaxed, EXCLUDED.exempt, EXCLUDED.other_taxes,
               EXCLUDED.vat_total, EXCLUDED.total)
        RETURNING (xmax = 0) AS inserted
    )
    SELECT count(*) FILTER (WHERE inserted), count(*) FILTER (WHERE NOT inserted)
    INTO v_new, v_updated FROM up;

    UPDATE public.fiscal_voucher_imports
       SET rows_new = v_new, rows_updated = v_updated
     WHERE id = v_import_id;

    RETURN jsonb_build_object('import_id', v_import_id, 'rows_new', v_new,
                              'rows_updated', v_updated, 'date_from', v_from, 'date_to', v_to);
END;
$$;

REVOKE ALL ON FUNCTION public.cargar_comprobantes_arca(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cargar_comprobantes_arca(jsonb) TO authenticated;
