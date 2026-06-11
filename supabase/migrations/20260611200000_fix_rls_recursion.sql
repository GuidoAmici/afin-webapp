-- Función SECURITY DEFINER para leer el role sin disparar RLS
CREATE OR REPLACE FUNCTION public.get_my_profile_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Profiles: fix SELECT policy de empleados (subquery recursiva)
DROP POLICY IF EXISTS "Empleados leen todos los perfiles" ON public.profiles;
CREATE POLICY "Empleados leen todos los perfiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_profile_role() = 'empleado');

-- Profiles: fix UPDATE WITH CHECK (subquery recursiva)
DROP POLICY IF EXISTS "Cada usuario actualiza su propio perfil" ON public.profiles;
CREATE POLICY "Cada usuario actualiza su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (role = public.get_my_profile_role());

-- Orders: fix policy de empleados
DROP POLICY IF EXISTS "Empleados ven todos los pedidos" ON public.orders;
CREATE POLICY "Empleados ven todos los pedidos"
  ON public.orders FOR ALL
  USING (public.get_my_profile_role() = 'empleado');

-- Order items: fix policy de empleados
DROP POLICY IF EXISTS "Empleados ven todos los items" ON public.order_items;
CREATE POLICY "Empleados ven todos los items"
  ON public.order_items FOR ALL
  USING (public.get_my_profile_role() = 'empleado');
