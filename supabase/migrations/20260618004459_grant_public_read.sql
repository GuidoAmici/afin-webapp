-- Grants explícitos de lectura pública (infra-as-code).
-- Las migraciones corren como `postgres`, cuyos default privileges NO incluyen
-- SELECT para anon/authenticated (a diferencia de los de `supabase_admin`). En
-- cloud esto se había resuelto fuera de las migraciones (dashboard), dejando el
-- entorno local infiel. Codificamos los grants acá para que el schema sea
-- autosuficiente y reproducible. La RLS sigue gobernando las filas:
--   · categories/subcategories: políticas "public read" USING (true)
--   · products: "public read" USING (active = true) + políticas de staff
-- Es idempotente: re-otorgar en cloud no cambia nada.

BEGIN;

-- El catálogo público (anon) lee categorías/subcategorías directamente.
GRANT SELECT ON public.categories    TO anon, authenticated;
GRANT SELECT ON public.subcategories TO anon, authenticated;

-- products: anon lo consume vía la vista products_with_stock (owner-run), así que
-- NO recibe acceso directo (no ve stock_fisico crudo). El checkout server-side
-- (orders API) sí lee products como el usuario autenticado.
GRANT SELECT ON public.products TO authenticated;

COMMIT;
