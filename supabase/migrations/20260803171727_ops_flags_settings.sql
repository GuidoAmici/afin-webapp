-- ============================================================
-- Ops flags en `settings`: perillas que se mueven en caliente, sin deploy.
--
-- Los flags de release viven en variables de entorno (ver lib/flags.ts y
-- docs/adr/0005). Acá viven los que tiene que poder mover un admin desde el
-- panel un sábado a la noche: cortar cobros, habilitar transferencia, prender
-- el job de expiración.
-- ============================================================

-- ------------------------------------------------------------
-- Fix: la policy original chequeaba = 'empleado' y dejaba afuera a los admin,
-- que son justamente quienes deben tocar esta tabla (PRD-0002, historias 21/22/26).
-- Mismo bug que ADR-008 corrigió en proxy.ts, acá pendiente.
--
-- Modelo nuevo, alineado al PRD: cualquier autenticado LEE; solo admin ESCRIBE.
-- Es más restrictivo que antes para el rol `empleado` — deliberado: el descuento,
-- los datos bancarios y estos flags son decisiones de negocio, no de operación
-- diaria. Hoy no rompe nada porque todavía no existe UI que escriba settings (#18).
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Empleados gestionan settings" ON public.settings;
DROP POLICY IF EXISTS "Admin escribe settings" ON public.settings;

CREATE POLICY "Admin escribe settings"
  ON public.settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- La policy de lectura ("Usuarios autenticados leen settings") se mantiene: el
-- cliente necesita descuento y datos bancarios para el checkout.

-- ------------------------------------------------------------
-- Flags. El valor es JSONB booleano; el lector (lib/settings.ts) cae al default
-- del código si la key falta o trae algo que no entiende.
-- ------------------------------------------------------------

INSERT INTO public.settings (key, value) VALUES
  -- Kill switch de cobros. Apagado, el sitio deja de crear preferences de pago
  -- y el pedido queda igual de válido: se coordina el cobro por fuera.
  ('payments_enabled',     'true'),

  -- Pago por transferencia (#15). Off hasta que la feature exista.
  ('transfer_enabled',     'false'),

  -- Job de expiración de pedidos confirmados impagos (#19). Off hasta que exista.
  ('order_expiry_enabled', 'false'),
  ('order_expiry_days',    '7')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.settings IS
  'Configuración y ops flags del tenant. Lectura: autenticados. Escritura: admin. '
  'Los flags de release NO van acá — van en env vars (docs/adr/0005).';
