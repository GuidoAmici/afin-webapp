-- Prevenir que clientes escalen el status de su propio pedido.
-- WITH CHECK previo solo verificaba ownership; ahora fija también status = 'nuevo',
-- por lo que cualquier UPDATE que intente cambiar status es rechazado por RLS.
DROP POLICY IF EXISTS "Usuarios actualizan pedidos pendientes" ON public.orders;
CREATE POLICY "Usuarios actualizan pedidos pendientes"
  ON public.orders FOR UPDATE
  USING  (auth.uid() = user_id AND status = 'nuevo')
  WITH CHECK (auth.uid() = user_id AND status = 'nuevo');
