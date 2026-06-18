-- Stock disponible derivado (ADR-007)
-- El stock físico (products.stock_fisico) solo baja al despachar (ver
-- transition_order_stock). `comprometido` = suma de ítems en pedidos PAGADOS y NO
-- despachados, calculado on-the-fly (nunca un contador almacenado). El catálogo
-- público consume `disponible = físico − comprometido` para derivar `en_stock`.
-- Un pedido impago no compromete stock.

BEGIN;

-- ============================================================
-- PRODUCTS: stock físico (numérico) + stock_status (display del catálogo)
-- `stock_fisico` NULL = producto no rastreado (siempre disponible).
-- `stock_status` reemplaza al viejo `badge`: es el eje de display editable
-- por el panel /empleados (#18); 'en_stock' compone con el disponible derivado.
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_fisico INTEGER CHECK (stock_fisico >= 0),
  ADD COLUMN IF NOT EXISTS stock_status TEXT NOT NULL DEFAULT 'en_stock'
    CHECK (stock_status IN ('en_stock', 'consultar', 'proximamente'));

-- Migrar el display manual: badge 'consult' → 'consultar'; el resto ('stock',
-- 'new') colapsa en 'en_stock' (ningún producto del seed usa 'new').
UPDATE public.products
  SET stock_status = CASE badge WHEN 'consult' THEN 'consultar' ELSE 'en_stock' END;

ALTER TABLE public.products DROP COLUMN IF EXISTS badge;

-- ============================================================
-- COMMITTED_STOCK: agregado de lo comprometido por producto.
-- SECURITY DEFINER es el hueco controlado: devuelve solo un entero agregado
-- (nunca filas de pedidos), de modo que el catálogo anónimo puede consumirlo
-- sin tener acceso de lectura a orders/order_items.
-- ============================================================

CREATE OR REPLACE FUNCTION public.committed_stock(p_product_id text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(SUM(oi.quantity), 0)::int
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  WHERE oi.product_id = p_product_id
    AND o.payment_status = 'pagado'
    AND o.status NOT IN ('despachado', 'entregado', 'cancelado');
$$;

REVOKE ALL ON FUNCTION public.committed_stock(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.committed_stock(text) TO anon, authenticated, service_role;

-- ============================================================
-- PRODUCTS_WITH_STOCK: superficie de lectura pública del catálogo.
-- Corre como owner (no security_invoker) y filtra `active = true` adentro: así
-- el catálogo anónimo NO necesita acceso de lectura directo a la tabla products
-- (no se filtra el stock físico crudo). Solo expone `disponible` y `en_stock`
-- derivados (no `stock_fisico` ni `comprometido`, que son internos). Los labels
-- de categoría/subcategoría van embebidos para no depender de FKs de PostgREST.
-- ============================================================

CREATE OR REPLACE VIEW public.products_with_stock AS
SELECT
  p.id,
  p.name,
  p.category_id,
  p.subcategory_id,
  p.image,
  p.images,
  p.stock_status,
  p.price_retail,
  p.price_wholesale,
  p.description,
  p.sort_order,
  p.active,
  CASE WHEN p.stock_fisico IS NULL
       THEN NULL
       ELSE p.stock_fisico - cs.comprometido
  END AS disponible,
  CASE
    WHEN p.stock_status <> 'en_stock' THEN false
    WHEN p.stock_fisico IS NULL       THEN true   -- no rastreado: siempre disponible
    ELSE (p.stock_fisico - cs.comprometido) > 0
  END AS en_stock,
  cat.label AS category_label,
  sub.label AS subcategory_label
FROM public.products p
JOIN public.categories    cat ON cat.id = p.category_id
JOIN public.subcategories sub ON sub.id = p.subcategory_id
CROSS JOIN LATERAL (SELECT public.committed_stock(p.id) AS comprometido) cs
WHERE p.active = true;

GRANT SELECT ON public.products_with_stock TO anon, authenticated;

COMMIT;
