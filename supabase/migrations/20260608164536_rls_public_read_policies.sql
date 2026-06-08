BEGIN;

DROP POLICY IF EXISTS "public read categories"    ON public.categories;
DROP POLICY IF EXISTS "public read subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "public read products"      ON public.products;

CREATE POLICY "public read categories"    ON public.categories    FOR SELECT USING (true);
CREATE POLICY "public read subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "public read products"      ON public.products      FOR SELECT USING (active = true);

COMMIT;
