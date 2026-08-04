-- ============================================================
-- replace_order_items: reemplazo atómico de los ítems de un pedido.
--
-- El route handler de /api/orders hacía DELETE + INSERT en dos requests. Si el
-- INSERT fallaba, el pedido quedaba vivo y vacío: los ítems ya estaban borrados
-- y no volvían. Y dos requests concurrentes del mismo usuario podían intercalarse
-- y dejar el pedido con los ítems de uno solo.
--
-- Acá pasa a ser una sola transacción, con el precio resuelto adentro de la base
-- desde `products` — el invariante de PRD-0002 (el frontend nunca elige el precio)
-- deja de depender de que el route handler se acuerde de resolverlo.
-- ============================================================

CREATE OR REPLACE FUNCTION public.replace_order_items(
  p_order_id UUID,
  p_items    JSONB,
  p_notes    TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER            -- corre con el JWT del caller: la RLS de order_items aplica sola (ADR-004)
SET search_path = ''
AS $$
DECLARE
  v_status TEXT;
BEGIN
  -- El pedido tiene que existir y ser visible para el caller. Con SECURITY INVOKER
  -- la RLS ya lo limita a los suyos; este SELECT convierte "no lo ves" en un error
  -- explícito en vez de un no-op silencioso.
  SELECT status INTO v_status
  FROM public.orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'pedido inexistente o no accesible: %', p_order_id
      USING ERRCODE = 'no_data_found';
  END IF;

  -- Solo se reemplazan ítems de un pedido todavía pendiente. Una vez confirmado,
  -- el precio está snapshoteado y tocarlo rompería el pedido (ADR-005).
  IF v_status <> 'pendiente' THEN
    RAISE EXCEPTION 'el pedido % no está pendiente (está %)', p_order_id, v_status
      USING ERRCODE = 'check_violation';
  END IF;

  DELETE FROM public.order_items WHERE order_id = p_order_id;

  INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
  SELECT
    p_order_id,
    item.product_id,
    item.quantity,
    -- Precio de catálogo, resuelto acá. Nunca el que mandó el cliente.
    COALESCE(prod.price_retail, prod.price_wholesale)
  FROM jsonb_to_recordset(p_items) AS item(product_id TEXT, quantity INTEGER)
  JOIN public.products prod ON prod.id = item.product_id
  WHERE item.quantity > 0;

  UPDATE public.orders SET notes = p_notes WHERE id = p_order_id;
END $$;

COMMENT ON FUNCTION public.replace_order_items IS
  'Reemplaza los ítems de un pedido pendiente en una sola transacción, resolviendo '
  'el precio desde products. Reemplaza el DELETE+INSERT del route handler.';

REVOKE ALL ON FUNCTION public.replace_order_items(UUID, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_order_items(UUID, JSONB, TEXT) TO authenticated;
