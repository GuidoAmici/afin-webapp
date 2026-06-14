-- transition_order: cuello único de autorización de transiciones de estado (ADR-006)
--
-- Toda mutación de orders.status y orders.payment_status pasa por estas funciones
-- SECURITY DEFINER, que hacen su propia autorización (deducen rol del JWT / actor
-- explícito), validan contra la máquina de estados hardcodeada (ADR-005), aplican la
-- barrera cross-eje, escriben order_events y recién entonces hacen el UPDATE.
-- El UPDATE directo de esas columnas queda revocado para los usuarios.

BEGIN;

-- ============================================================
-- Helpers de rol (jerárquico: admin ⊇ empleado). SECURITY INVOKER.
-- ============================================================

CREATE OR REPLACE FUNCTION public.jwt_role()
RETURNS text LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role'
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT public.jwt_role() IN ('empleado', 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT public.jwt_role() = 'admin'
$$;

-- ============================================================
-- Núcleo: validación + auditoría + UPDATE. No invocable directamente.
-- Niveles de actor: cliente=0, empleado=1, admin=2, system=2.
-- ============================================================

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
  ELSE
    UPDATE public.orders
    SET payment_status = p_to
    WHERE id = p_order_id
    RETURNING * INTO v_updated;
  END IF;

  RETURN v_updated;
END;
$$;

-- ============================================================
-- Wrapper para usuarios autenticados — actor deducido del JWT.
-- ============================================================

CREATE OR REPLACE FUNCTION public.transition_order(
  p_order_id uuid,
  p_axis     text,
  p_to       text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role  text := public.jwt_role();
  v_uid   uuid := auth.uid();
  v_level int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'no autenticado' USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_level := CASE v_role
    WHEN 'admin'    THEN 2
    WHEN 'empleado' THEN 1
    ELSE 0
  END;

  RETURN public._transition_order_core(
    p_order_id, p_axis, p_to,
    v_uid, v_level, COALESCE(v_role, 'cliente'),
    (v_role = 'admin'),
    p_metadata
  );
END;
$$;

-- ============================================================
-- Wrapper para sistema (webhook MP, jobs) — actor explícito, corre con service_role.
-- ============================================================

CREATE OR REPLACE FUNCTION public.transition_order_system(
  p_order_id   uuid,
  p_axis       text,
  p_to         text,
  p_actor_id   uuid  DEFAULT NULL,
  p_actor_role text  DEFAULT 'system',
  p_metadata   jsonb DEFAULT '{}'::jsonb
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public._transition_order_core(
    p_order_id, p_axis, p_to,
    p_actor_id, 2, COALESCE(p_actor_role, 'system'),
    true,  -- system puede saltear la barrera de pago
    p_metadata
  );
END;
$$;

-- ============================================================
-- Privilegios de ejecución. Postgres/Supabase conceden EXECUTE a PUBLIC,
-- anon y authenticated por defecto; revocamos explícitamente de todos y
-- concedemos solo al rol correcto. El núcleo NO debe ser invocable por
-- nadie salvo los wrappers (que corren como owner): si authenticated
-- pudiera llamarlo vía /rpc, pasaría p_actor_level=2 y saltearía la auth.
-- ============================================================

REVOKE ALL ON FUNCTION
  public._transition_order_core(uuid, text, text, uuid, int, text, boolean, jsonb)
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.transition_order(uuid, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transition_order(uuid, text, text, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION
  public.transition_order_system(uuid, text, text, uuid, text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION
  public.transition_order_system(uuid, text, text, uuid, text, jsonb)
  TO service_role;

-- ============================================================
-- Revocar el UPDATE directo de columnas sensibles. RLS es por fila, no por
-- columna; usamos privilegios de columna. La función, como DEFINER (owner),
-- conserva el privilegio. El cliente solo puede editar `notes` de su pedido.
-- ============================================================

REVOKE UPDATE ON public.orders FROM authenticated, anon;
GRANT  UPDATE (notes) ON public.orders TO authenticated;

-- ============================================================
-- Roles jerárquicos: las policies de staff pasan de '= empleado' a is_staff()
-- (incluye admin). DROP/CREATE de las policies creadas en migraciones previas.
-- ============================================================

DROP POLICY IF EXISTS "Empleados ven todos los pedidos" ON public.orders;
CREATE POLICY "Staff gestiona todos los pedidos"
  ON public.orders FOR ALL
  USING (public.is_staff());

DROP POLICY IF EXISTS "Empleados ven todos los items" ON public.order_items;
CREATE POLICY "Staff gestiona todos los items"
  ON public.order_items FOR ALL
  USING (public.is_staff());

DROP POLICY IF EXISTS "Empleados leen todos los perfiles" ON public.profiles;
CREATE POLICY "Staff lee todos los perfiles"
  ON public.profiles FOR SELECT
  USING (public.is_staff());

DROP POLICY IF EXISTS "Empleados gestionan order_events" ON public.order_events;
CREATE POLICY "Staff gestiona order_events"
  ON public.order_events FOR ALL
  USING (public.is_staff());

DROP POLICY IF EXISTS "Empleados gestionan payments" ON public.payments;
CREATE POLICY "Staff gestiona payments"
  ON public.payments FOR ALL
  USING (public.is_staff());

DROP POLICY IF EXISTS "Empleados gestionan settings" ON public.settings;
CREATE POLICY "Staff gestiona settings"
  ON public.settings FOR ALL
  USING (public.is_staff());

DROP POLICY IF EXISTS "Dueño lee sus comprobantes" ON storage.objects;
CREATE POLICY "Dueño lee sus comprobantes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'comprobantes' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_staff()
    )
  );

DROP POLICY IF EXISTS "Empleados gestionan comprobantes" ON storage.objects;
CREATE POLICY "Staff gestiona comprobantes"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'comprobantes' AND public.is_staff()
  );

COMMIT;
