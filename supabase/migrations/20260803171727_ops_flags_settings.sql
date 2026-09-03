-- ============================================================
-- Ops flags en `settings`: perillas que se mueven en caliente, sin deploy.
--
-- Los flags de release viven en variables de entorno (ver lib/flags.ts y
-- docs/adr/0005). Acá viven los que tiene que poder mover un admin desde el
-- panel un sábado a la noche: cortar cobros, habilitar transferencia, prender
-- el job de expiración.
-- ============================================================

-- ------------------------------------------------------------
-- Las policies de `settings` NO se tocan acá. El modelo vigente lo fijó
-- transition_order.sql: "Staff gestiona settings" (FOR ALL, is_staff() =
-- empleado ∪ admin) para escribir, y "Usuarios autenticados leen settings"
-- para leer. Ese modelo ya contempla al admin.
--
-- Queda anotada la tensión con PRD-0002 (historias 21/22/26 piden que editar
-- descuento y datos bancarios sea admin-only): hoy cualquier empleado puede
-- escribir configuración, incluido el kill switch de cobros. Restringirlo es
-- una decisión de negocio, no un bug, y no corresponde colarla en la migración
-- que siembra los flags.
-- ------------------------------------------------------------

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
  'Configuración y ops flags del tenant. Lectura: autenticados. Escritura: staff. '
  'Los flags de release NO van acá — van en env vars (docs/adr/0005).';
