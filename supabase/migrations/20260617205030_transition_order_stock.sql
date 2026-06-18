-- Stock derivado: efectos de las transiciones sobre el stock físico (ADR-007).
-- Reemplaza _transition_order_core agregando dos efectos al final de cada eje:
--   · status → 'despachado'      : descuenta el físico de cada ítem del pedido.
--   · payment_status → 'pagado'  : si algún ítem queda sin disponible, mueve el
--                                  pedido a 'en_espera_stock' SIN bloquear el pago.
-- La firma no cambia, así que los wrappers (transition_order / _system) siguen igual.

BEGIN;

CREATE OR REPLACE FUNCTION public._transition_order_core(
  p_order_id     uuid,
  p_axis         text,
  p_to           text,
  p_actor_id     uuid,
  p_actor_level  int,
  p_actor_role   text,
  p_can_override boolean,
  p_metadata     jsonb
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order   public.orders;
  v_from    text;
  v_credito boolean;
  v_min     int;
  v_updated public.orders;
BEGIN
  IF p_axis NOT IN ('status', 'payment_status') THEN
    RAISE EXCEPTION 'eje inválido: %', p_axis USING ERRCODE = 'check_violation';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'pedido no encontrado: %', p_order_id USING ERRCODE = 'no_data_found';
  END IF;

  v_from := CASE p_axis WHEN 'status' THEN v_order.status ELSE v_order.payment_status END;

  -- No-op idempotente
  IF v_from = p_to THEN
    RETURN v_order;
  END IF;

  -- Máquina de estados hardcodeada: cada edge declara su nivel mínimo.
  SELECT t.min_level INTO v_min
  FROM (
    VALUES
      -- eje logístico (status)
      ('status', 'pendiente',      'confirmado',      1),
      ('status', 'confirmado',     'en_preparacion',  1),
      ('status', 'en_preparacion', 'listo',           1),
      ('status', 'listo',          'despachado',      1),
      ('status', 'despachado',     'entregado',       1),
      ('status', 'confirmado',     'en_espera_stock', 1),
      ('status', 'en_preparacion', 'en_espera_stock', 1),
      ('status', 'en_espera_stock','en_preparacion',  1),
      ('status', 'pendiente',      'cancelado',       1),
      ('status', 'confirmado',     'cancelado',       1),
      ('status', 'en_espera_stock','cancelado',       1),
      ('status', 'en_preparacion', 'cancelado',       2),  -- admin: forzar
      ('status', 'listo',          'cancelado',       2),  -- admin: forzar
      ('status', 'despachado',     'cancelado',       2),  -- admin: forzar
      ('status', 'confirmado',     'pendiente',       2),  -- admin: corrección
      ('status', 'en_preparacion', 'confirmado',      2),  -- admin: corrección
      -- eje de pago (payment_status)
      ('payment_status', 'pendiente',   'en_revision', 0),  -- cliente: subió comprobante
      ('payment_status', 'en_revision', 'pagado',      1),  -- empleado: corrobora
      ('payment_status', 'pendiente',   'pagado',      1),  -- empleado / system (MP)
      ('payment_status', 'en_revision', 'pendiente',   1),  -- empleado: rechaza
      ('payment_status', 'pagado',      'en_revision', 2),  -- admin: corrección
      ('payment_status', 'pagado',      'pendiente',   2)   -- admin: corrección
  ) AS t(axis, from_s, to_s, min_level)
  WHERE t.axis = p_axis AND t.from_s = v_from AND t.to_s = p_to;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'transición inválida: % de "%" a "%"', p_axis, v_from, p_to
      USING ERRCODE = 'check_violation';
  END IF;

  IF p_actor_level < v_min THEN
    RAISE EXCEPTION 'rol insuficiente: % de "%" a "%" requiere nivel %, actor tiene %',
      p_axis, v_from, p_to, v_min, p_actor_level
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Cliente (nivel 0) solo puede operar su propio pedido.
  IF p_actor_level = 0 THEN
    IF p_actor_id IS NULL OR p_actor_id <> v_order.user_id THEN
      RAISE EXCEPTION 'el cliente solo puede operar su propio pedido'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  -- Barrera cross-eje (ADR-005): confirmado → en_preparacion exige pago o crédito.
  IF p_axis = 'status' AND v_from = 'confirmado' AND p_to = 'en_preparacion'
     AND NOT p_can_override THEN
    SELECT credito_habilitado INTO v_credito FROM public.profiles WHERE id = v_order.user_id;
    IF v_order.payment_status <> 'pagado' AND COALESCE(v_credito, false) = false THEN
      RAISE EXCEPTION 'no se puede preparar: el pedido no está pagado ni tiene crédito habilitado'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- Auditoría append-only en la misma transacción.
  INSERT INTO public.order_events
    (order_id, event_type, from_status, to_status, actor_id, actor_role, metadata)
  VALUES
    (p_order_id, 'transition:' || p_axis, v_from, p_to, p_actor_id, p_actor_role,
     COALESCE(p_metadata, '{}'::jsonb));

  IF p_axis = 'status' THEN
    UPDATE public.orders
    SET status        = p_to,
        confirmed_at  = CASE WHEN p_to = 'confirmado'     THEN now() ELSE confirmed_at  END,
        prepared_at   = CASE WHEN p_to = 'en_preparacion' THEN now() ELSE prepared_at   END,
        ready_at      = CASE WHEN p_to = 'listo'          THEN now() ELSE ready_at      END,
        dispatched_at = CASE WHEN p_to = 'despachado'     THEN now() ELSE dispatched_at END,
        delivered_at  = CASE WHEN p_to = 'entregado'      THEN now() ELSE delivered_at  END
    WHERE id = p_order_id
    RETURNING * INTO v_updated;

    -- Efecto de stock: el físico SOLO baja al despachar. Se descuenta lo pedido
    -- de cada producto rastreado (stock_fisico IS NOT NULL); GREATEST(...,0) evita
    -- violar el CHECK >= 0 si el pedido estaba sobrevendido (en_espera_stock).
    IF p_to = 'despachado' THEN
      UPDATE public.products pr
      SET stock_fisico = GREATEST(pr.stock_fisico - agg.qty, 0)
      FROM (
        SELECT product_id, SUM(quantity)::int AS qty
        FROM public.order_items
        WHERE order_id = p_order_id
        GROUP BY product_id
      ) AS agg
      WHERE pr.id = agg.product_id AND pr.stock_fisico IS NOT NULL;
    END IF;

  ELSE
    UPDATE public.orders
    SET payment_status = p_to
    WHERE id = p_order_id
    RETURNING * INTO v_updated;

    -- Efecto de stock: al pagar, el pedido pasa a comprometer stock. Si algún
    -- ítem rastreado queda sin disponible (físico − comprometido < 0), el pedido
    -- entra en 'en_espera_stock' SIN bloquear el pago (ADR-007). Se hace acá, como
    -- autoridad única de transiciones, con su propio evento de auditoría.
    IF p_to = 'pagado'
       AND v_updated.status IN ('pendiente', 'confirmado', 'en_preparacion')
       AND EXISTS (
         SELECT 1
         FROM public.order_items oi
         JOIN public.products pr ON pr.id = oi.product_id
         WHERE oi.order_id = p_order_id
           AND pr.stock_fisico IS NOT NULL
           AND pr.stock_fisico - public.committed_stock(pr.id) < 0
       )
    THEN
      INSERT INTO public.order_events
        (order_id, event_type, from_status, to_status, actor_id, actor_role, metadata)
      VALUES
        (p_order_id, 'stock:insuficiente', v_updated.status, 'en_espera_stock',
         p_actor_id, p_actor_role, '{}'::jsonb);

      UPDATE public.orders
      SET status = 'en_espera_stock'
      WHERE id = p_order_id
      RETURNING * INTO v_updated;
    END IF;
  END IF;

  RETURN v_updated;
END;
$$;

COMMIT;
