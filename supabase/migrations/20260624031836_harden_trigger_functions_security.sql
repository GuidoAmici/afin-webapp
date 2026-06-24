-- Seguridad (#23): endurecer trigger functions preexistentes.
--
-- Los advisors de Supabase marcan:
--   1. function_search_path_mutable — set_updated_at y handle_new_user no fijan
--      search_path (riesgo de search_path hijacking; crítico en handle_new_user,
--      que es SECURITY DEFINER).
--   2. anon/authenticated_security_definer_function_executable — handle_new_user
--      y rls_auto_enable son SECURITY DEFINER invocables como RPC vía
--      /rest/v1/rpc/... Son trigger functions: no deben ser llamables por el
--      cliente. Los triggers corren con privilegios del owner; no requieren
--      EXECUTE del rol del caller.
--
-- rls_auto_enable ya tiene search_path fijo (=pg_catalog); solo se le revoca
-- EXECUTE. transition_order / prepare_checkout / register_transfer_payment son
-- RPCs legítimos con sus propias guardas y quedan fuera de alcance.

BEGIN;

-- ============================================================
-- search_path fijo en las trigger functions
-- ============================================================

-- set_updated_at: SECURITY INVOKER, solo usa NOW() (pg_catalog, siempre en path).
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- handle_new_user: SECURITY DEFINER; con search_path='' hay que calificar el
-- esquema de los objetos propios (public.profiles). split_part/COALESCE son
-- de pg_catalog y resuelven sin calificar.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, empresa)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'empresa'
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- Revocar EXECUTE: estas funciones solo corren como trigger,
-- nunca como RPC del cliente.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.set_updated_at()  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- rls_auto_enable existe en los entornos reales (test/prod) pero NO está
-- definida por ninguna migración, así que en la DB local que el CI arma desde
-- cero (job pgTAP) no existe. Guardamos el REVOKE tras un chequeo de existencia
-- para que aplique donde la función está y se omita donde no.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable' AND p.pronargs = 0
  ) THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
  END IF;
END $$;

COMMIT;
