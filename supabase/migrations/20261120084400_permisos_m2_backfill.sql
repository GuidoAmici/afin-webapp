-- Modelo de permisos (M2): backfill desde el rol del JWT y convivencia rol-permiso.
-- NO es expand-only (reescribe policies y cuerpos de funciones existentes); Guido lo
-- aprobó el 2026-11-19. Todo sigue andando con el código desplegado: el rol del JWT
-- (empleado/admin) vale igual que antes; los permisos se SUMAN.
--
--   · backfill: empleado -> plantilla encargado, admin -> plantilla administrador
--   · is_staff(): rol del JWT o permiso pedidos:ver
--   · transition_order: nivel de actor = el mayor entre rol y permisos
--   · "Usuarios crean items": sólo en pedidos pendientes
--   · profiles self-only (ADR-0015 de New Haze): lo propio, o todo con usuarios:ver / rol staff
--   · committed_stock sin EXECUTE para anon; products_with_stock lo calcula inline

-- ── Backfill (idempotente) ───────────────────────────────────────────────
-- otorgado_por NULL: backfill M2 (no lo otorgó una persona).
CREATE FUNCTION private.sincronizar_permisos_desde_roles() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_n integer;
BEGIN
    WITH quien AS (
        SELECT u.id AS user_id,
               CASE u.raw_app_meta_data ->> 'role'
                   WHEN 'admin' THEN 'administrador'
                   ELSE 'encargado'
               END AS plantilla
        FROM auth.users u
        WHERE u.raw_app_meta_data ->> 'role' IN ('empleado', 'admin')
    ), ins AS (
        INSERT INTO public.acceso_asignaciones (user_id, permiso, otorgado_por)
        SELECT q.user_id, p.permiso, NULL
        FROM quien q
        JOIN public.acceso_plantilla_permisos p ON p.plantilla = q.plantilla
        ON CONFLICT (user_id, permiso) WHERE revocado_en IS NULL DO NOTHING
        RETURNING 1
    )
    SELECT count(*) INTO v_n FROM ins;
    RETURN v_n;
END
$$;
REVOKE ALL ON FUNCTION private.sincronizar_permisos_desde_roles() FROM PUBLIC, anon, authenticated;

SELECT private.sincronizar_permisos_desde_roles();

-- ── is_staff(): rol del JWT o permiso ────────────────────────────────────
-- Pasa a SECURITY DEFINER: Postgres chequea el acceso al schema private al planificar
-- la función, aunque la rama no se ejecute, y anon (que evalúa is_staff() en políticas
-- de lectura pública) no tiene acceso a private. Como definer el chequeo es del dueño.
-- EXCEPCIÓN a "REVOKE de anon": sólo devuelve un booleano sobre el propio que llama
-- (igual que jwt_role()), y las políticas la necesitan para anon.
-- COALESCE: nunca NULL (antes, sin rol en el JWT devolvía NULL).
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT CASE
    WHEN COALESCE((SELECT auth.jwt()) -> 'app_metadata' ->> 'role' IN ('empleado', 'admin'), false) THEN true
    WHEN (SELECT auth.uid()) IS NULL THEN false
    ELSE private.tiene_permiso('pedidos:ver')
  END
$$;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated, service_role;

-- ── transition_order: nivel = max(rol, permisos) ─────────────────────────
-- Misma firma y mismos privilegios. transition_order_system y _core no se tocan.
CREATE OR REPLACE FUNCTION public.transition_order(
  p_order_id uuid,
  p_axis     text,
  p_to       text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role  text := public.jwt_role();
  v_uid   uuid := auth.uid();
  v_level int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'no autenticado' USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_level := GREATEST(
    CASE v_role
      WHEN 'admin'    THEN 2
      WHEN 'empleado' THEN 1
      ELSE 0
    END,
    CASE
      WHEN private.tiene_permiso('pedidos:corregir') THEN 2
      WHEN private.tiene_permiso('pedidos:editar')   THEN 1
      ELSE 0
    END
  );

  RETURN public._transition_order_core(
    p_order_id, p_axis, p_to,
    v_uid, v_level, COALESCE(v_role, 'cliente'),
    (v_role = 'admin'),
    p_metadata
  );
END;
$$;

REVOKE ALL ON FUNCTION public.transition_order(uuid, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transition_order(uuid, text, text, jsonb) TO authenticated;

-- ── Ítems: el cliente sólo agrega a un pedido pendiente ──────────────────
DROP POLICY IF EXISTS "Usuarios crean items" ON public.order_items;
CREATE POLICY "Usuarios crean items"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = order_id AND user_id = auth.uid() AND status = 'pendiente'));

-- ── profiles self-only ───────────────────────────────────────────────────
-- "Cada usuario lee su propio perfil" ya existe. La lectura ajena pasa de is_staff()
-- (que ahora incluye pedidos:ver) a usuarios:ver o, mientras dure la convivencia,
-- el rol de staff del JWT.
DROP POLICY IF EXISTS "Staff lee todos los perfiles" ON public.profiles;
CREATE POLICY "Staff lee todos los perfiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    CASE
      WHEN COALESCE(public.jwt_role() IN ('empleado', 'admin'), false) THEN true
      WHEN (SELECT auth.uid()) IS NULL THEN false
      ELSE private.tiene_permiso('usuarios:ver')
    END
  );

-- ── Stock: committed_stock fuera del alcance de anon ─────────────────────
-- La vista corre como dueño; Postgres chequea EXECUTE de las funciones que llama
-- contra quien consulta, así que no puede llamar a committed_stock y a la vez
-- negárselo a anon: calcula lo comprometido inline, con el mismo predicado.
-- Mismas columnas y orden; sigue sin security_invoker (anon no lee products).
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
    WHEN p.stock_fisico IS NULL       THEN true
    ELSE (p.stock_fisico - cs.comprometido) > 0
  END AS en_stock,
  cat.label AS category_label,
  sub.label AS subcategory_label
FROM public.products p
JOIN public.categories    cat ON cat.id = p.category_id
JOIN public.subcategories sub ON sub.id = p.subcategory_id
CROSS JOIN LATERAL (
  SELECT COALESCE(SUM(oi.quantity), 0)::int AS comprometido
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  WHERE oi.product_id = p.id
    AND o.payment_status = 'pagado'
    AND o.status NOT IN ('despachado', 'entregado', 'cancelado')
) cs
WHERE p.active = true;

REVOKE EXECUTE ON FUNCTION public.committed_stock(text) FROM anon;
