-- Usuarios pueden actualizar sus propios pedidos pendientes (solo 'nuevo')
DROP POLICY IF EXISTS "Usuarios actualizan pedidos pendientes" ON public.orders;
CREATE POLICY "Usuarios actualizan pedidos pendientes"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'nuevo')
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden eliminar ítems de sus pedidos pendientes
DROP POLICY IF EXISTS "Usuarios eliminan items de pedidos pendientes" ON public.order_items;
CREATE POLICY "Usuarios eliminan items de pedidos pendientes"
  ON public.order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid() AND status = 'nuevo'
    )
  );
