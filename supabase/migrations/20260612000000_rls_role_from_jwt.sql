-- El role de empleado vive en app_metadata del JWT (solo escribible con la
-- service role key). Las políticas dejan de depender de profiles.role, que
-- está en una tabla del schema public y constituye superficie de escalación.
BEGIN;

-- Profiles: empleados leen todos los perfiles
DROP POLICY IF EXISTS "Empleados leen todos los perfiles" ON public.profiles;
CREATE POLICY "Empleados leen todos los perfiles"
  ON public.profiles FOR SELECT
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'empleado');

-- Profiles: el WITH CHECK anti-escalación ya no es necesario porque la
-- columna role desaparece de la tabla
DROP POLICY IF EXISTS "Cada usuario actualiza su propio perfil" ON public.profiles;
CREATE POLICY "Cada usuario actualiza su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Orders: empleados operan sobre todos los pedidos
DROP POLICY IF EXISTS "Empleados ven todos los pedidos" ON public.orders;
CREATE POLICY "Empleados ven todos los pedidos"
  ON public.orders FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'empleado');

-- Order items: ídem
DROP POLICY IF EXISTS "Empleados ven todos los items" ON public.order_items;
CREATE POLICY "Empleados ven todos los items"
  ON public.order_items FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'empleado');

-- La función y la columna quedan obsoletas: una sola fuente de verdad (JWT)
DROP FUNCTION IF EXISTS public.get_my_profile_role();
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

COMMIT;
