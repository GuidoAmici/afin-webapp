-- Precios a NUMERIC: el checkout (MP, ADR fase 2) necesita montos numéricos.
-- Hoy price_retail/price_wholesale/unit_price son TEXT y están en NULL, así que
-- la conversión es limpia. La carga de los valores reales va aparte (#24).

BEGIN;

ALTER TABLE public.products
  ALTER COLUMN price_retail    TYPE numeric(12,2) USING NULLIF(price_retail, '')::numeric,
  ALTER COLUMN price_wholesale TYPE numeric(12,2) USING NULLIF(price_wholesale, '')::numeric;

ALTER TABLE public.order_items
  ALTER COLUMN unit_price TYPE numeric(12,2) USING NULLIF(unit_price, '')::numeric;

COMMIT;
