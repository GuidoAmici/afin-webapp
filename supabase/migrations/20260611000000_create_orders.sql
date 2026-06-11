BEGIN;

CREATE TABLE IF NOT EXISTS public.orders (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id),
  status     TEXT        NOT NULL DEFAULT 'nuevo'
                         CHECK (status IN ('nuevo','contactado','esperando_pago','confirmado','en_preparacion','despachado','entregado','cancelado')),
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  TEXT        NOT NULL REFERENCES public.products(id),
  quantity    INTEGER     NOT NULL CHECK (quantity > 0),
  unit_price  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Clientes ven y crean sus propios pedidos
DROP POLICY IF EXISTS "Usuarios ven sus pedidos" ON public.orders;
CREATE POLICY "Usuarios ven sus pedidos"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios crean pedidos" ON public.orders;
CREATE POLICY "Usuarios crean pedidos"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios ven sus items" ON public.order_items;
CREATE POLICY "Usuarios ven sus items"
  ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Usuarios crean items" ON public.order_items;
CREATE POLICY "Usuarios crean items"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));

-- Empleados ven y gestionan todos los pedidos
DROP POLICY IF EXISTS "Empleados ven todos los pedidos" ON public.orders;
CREATE POLICY "Empleados ven todos los pedidos"
  ON public.orders FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'empleado'));

DROP POLICY IF EXISTS "Empleados ven todos los items" ON public.order_items;
CREATE POLICY "Empleados ven todos los items"
  ON public.order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'empleado'));

COMMIT;
