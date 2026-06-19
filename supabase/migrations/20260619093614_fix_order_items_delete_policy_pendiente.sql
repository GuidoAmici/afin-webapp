-- Fix: la policy de DELETE de order_items quedó atada al estado 'nuevo', que la
-- migración fase2 (20260613074322, ADR-005) renombró a 'pendiente'. Como ningún
-- pedido tiene ya status = 'nuevo', la policy nunca matchea: el "reemplazar ítems"
-- de un pedido pendiente (al agregar al carrito) no puede borrar los ítems viejos
-- y el endpoint devuelve "Error al actualizar el pedido".
--
-- order_update_policies (20260611210000) creó esta policy; fase2 migró la policy
-- UPDATE de orders pero omitió esta. Acá la alineamos con el vocabulario vigente.

DROP POLICY IF EXISTS "Usuarios eliminan items de pedidos pendientes" ON public.order_items;
CREATE POLICY "Usuarios eliminan items de pedidos pendientes"
  ON public.order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
        AND orders.status = 'pendiente'
    )
  );
