-- Seguridad (#22): restringir el estado inicial en el INSERT de pedidos.
--
-- #13 cerró el UPDATE directo de status/payment_status (todo pasa por
-- transition_order), pero el INSERT no restringía el estado inicial: la policy
-- "Usuarios crean pedidos" validaba solo el dueño (auth.uid() = user_id), no las
-- columnas de estado. Un cliente podía crear un pedido con status='entregado' o
-- payment_status='pagado' directamente.
--
-- Invariante: un pedido creado por un cliente nace en pendiente/pendiente. Se
-- refuerza en el WITH CHECK de la policy de INSERT del cliente. Los empleados
-- conservan su policy FOR ALL (pueden cargar pedidos en cualquier estado desde
-- /empleados). El flujo normal (app/api/orders/route.ts) inserta solo
-- {user_id, notes} y toma los defaults 'pendiente', así que no se ve afectado.

BEGIN;

DROP POLICY IF EXISTS "Usuarios crean pedidos" ON public.orders;
CREATE POLICY "Usuarios crean pedidos"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pendiente'
    AND payment_status = 'pendiente'
  );

COMMIT;
