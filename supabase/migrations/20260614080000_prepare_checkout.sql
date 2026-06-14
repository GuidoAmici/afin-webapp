-- prepare_checkout: fija el monto del pedido server-side antes de pagar.
--
-- El #13 revocó el UPDATE directo de orders (solo `notes`). El total no puede
-- venir del cliente. Esta función SECURITY DEFINER toma el snapshot de precios
-- desde products (autoritativo), calcula el total (con descuento de transferencia
-- si aplica, desde settings), y persiste payment_method/discount_pct/total.
-- Devuelve el pedido actualizado. La crea el dueño del pedido (o staff).

BEGIN;

CREATE OR REPLACE FUNCTION public.prepare_checkout(
  p_order_id       uuid,
  p_payment_method text
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order    public.orders;
  v_total    numeric(12,2);
  v_discount numeric(5,2) := 0;
  v_missing  int;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'pedido no encontrado: %', p_order_id USING ERRCODE = 'no_data_found';
  END IF;

  -- Autorización: dueño del pedido o staff.
  IF auth.uid() IS NULL OR (auth.uid() <> v_order.user_id AND NOT public.is_staff()) THEN
    RAISE EXCEPTION 'no autorizado' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_payment_method NOT IN ('mercadopago', 'transferencia') THEN
    RAISE EXCEPTION 'medio de pago inválido: %', p_payment_method USING ERRCODE = 'check_violation';
  END IF;

  IF v_order.payment_status = 'pagado' THEN
    RAISE EXCEPTION 'el pedido ya está pagado' USING ERRCODE = 'check_violation';
  END IF;

  -- Snapshot de precios desde products (fuente de verdad).
  UPDATE public.order_items oi
  SET unit_price = p.price_retail
  FROM public.products p
  WHERE oi.order_id = p_order_id AND oi.product_id = p.id;

  -- No se puede cobrar online si falta algún precio.
  SELECT count(*) INTO v_missing
  FROM public.order_items
  WHERE order_id = p_order_id AND unit_price IS NULL;
  IF v_missing > 0 THEN
    RAISE EXCEPTION 'hay % producto(s) sin precio; no se puede pagar online', v_missing
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT COALESCE(sum(unit_price * quantity), 0) INTO v_total
  FROM public.order_items
  WHERE order_id = p_order_id;

  IF v_total <= 0 THEN
    RAISE EXCEPTION 'el total del pedido es 0' USING ERRCODE = 'check_violation';
  END IF;

  -- Descuento por transferencia (desde settings; #15 lo usa).
  IF p_payment_method = 'transferencia' THEN
    SELECT COALESCE((value #>> '{}')::numeric, 0) INTO v_discount
    FROM public.settings WHERE key = 'transfer_discount_pct';
    v_total := round(v_total * (1 - v_discount / 100.0), 2);
  END IF;

  UPDATE public.orders
  SET payment_method = p_payment_method,
      discount_pct   = v_discount,
      total          = v_total
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION public.prepare_checkout(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.prepare_checkout(uuid, text) TO authenticated;

COMMIT;
