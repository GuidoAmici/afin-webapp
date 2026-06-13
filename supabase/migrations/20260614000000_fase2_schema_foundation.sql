-- Fase 2: fundación del schema de pedidos (ADR-005)
-- Establece los dos ejes de estado ortogonales y las tablas de soporte.
-- Bloqueante para transition_order y todo lo que sigue.

BEGIN;

-- ============================================================
-- ORDERS: agregar eje de pago y migrar eje logístico
-- ============================================================

-- Eliminar el constraint original ANTES de migrar datos (si la columna usa los valores viejos).
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status  TEXT          NOT NULL DEFAULT 'pendiente'
    CHECK (payment_status IN ('pendiente', 'en_revision', 'pagado')),
  ADD COLUMN IF NOT EXISTS payment_method  TEXT,
  ADD COLUMN IF NOT EXISTS discount_pct    NUMERIC(5,2)  CHECK (discount_pct >= 0 AND discount_pct <= 100),
  ADD COLUMN IF NOT EXISTS total           NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS confirmed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS prepared_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ready_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dispatched_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at    TIMESTAMPTZ;

-- Migrar estados viejos al conjunto logístico del ADR-005.
-- 'nuevo', 'contactado', 'esperando_pago' colapsan en 'pendiente'.
UPDATE public.orders
  SET status = 'pendiente'
  WHERE status IN ('nuevo', 'contactado', 'esperando_pago');

ALTER TABLE public.orders
  ALTER COLUMN status SET DEFAULT 'pendiente';

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
    CHECK (status IN (
      'pendiente', 'confirmado', 'en_preparacion', 'listo',
      'despachado', 'entregado', 'en_espera_stock', 'cancelado'
    ));

-- Actualizar política RLS que dependía del estado 'nuevo' (renombrado a 'pendiente').
DROP POLICY IF EXISTS "Usuarios actualizan pedidos pendientes" ON public.orders;
CREATE POLICY "Usuarios actualizan pedidos pendientes"
  ON public.orders FOR UPDATE
  USING  (auth.uid() = user_id AND status = 'pendiente')
  WITH CHECK (auth.uid() = user_id AND status = 'pendiente');

-- ============================================================
-- ORDER_EVENTS: registro append-only de transiciones de estado
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type  TEXT        NOT NULL,
  from_status TEXT,
  to_status   TEXT,
  actor_id    UUID        REFERENCES auth.users(id),
  actor_role  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven eventos de sus pedidos"
  ON public.order_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Empleados gestionan order_events"
  ON public.order_events FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'empleado');

-- ============================================================
-- PAYMENTS: detalle contable con idempotencia por provider_payment_id
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider_payment_id TEXT          UNIQUE,
  amount              NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method      TEXT,
  payment_date        TIMESTAMPTZ,
  verified_by         UUID          REFERENCES auth.users(id),
  notes               TEXT,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven pagos de sus pedidos"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Empleados gestionan payments"
  ON public.payments FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'empleado');

-- ============================================================
-- SETTINGS: key-value de configuración del tenant
-- ============================================================

CREATE TABLE IF NOT EXISTS public.settings (
  key        TEXT        PRIMARY KEY,
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Empleados leen y modifican toda la configuración.
CREATE POLICY "Empleados gestionan settings"
  ON public.settings FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'empleado');

-- Usuarios autenticados leen settings (necesitan descuento y datos bancarios).
CREATE POLICY "Usuarios autenticados leen settings"
  ON public.settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

INSERT INTO public.settings (key, value) VALUES
  ('transfer_discount_pct', '5'),
  ('datos_bancarios', '{"banco":"","alias":"","cbu":"","titular":""}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- PROFILES: crédito habilitado para clientes de cuenta corriente
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credito_habilitado BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- STORAGE: bucket privado para comprobantes de transferencia
-- Estructura de path: {user_id}/{order_id}/{filename}
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comprobantes',
  'comprobantes',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Dueño lee sus comprobantes" ON storage.objects;
CREATE POLICY "Dueño lee sus comprobantes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'comprobantes' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'empleado'
    )
  );

DROP POLICY IF EXISTS "Dueño sube sus comprobantes" ON storage.objects;
CREATE POLICY "Dueño sube sus comprobantes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'comprobantes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Dueño elimina sus comprobantes" ON storage.objects;
CREATE POLICY "Dueño elimina sus comprobantes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'comprobantes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Empleados gestionan comprobantes" ON storage.objects;
CREATE POLICY "Empleados gestionan comprobantes"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'comprobantes' AND
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'empleado'
  );

COMMIT;
