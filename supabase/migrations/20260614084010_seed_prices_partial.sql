-- Carga parcial de precios desde "AFIN - Lista de Precios General.xlsx" (#24).
-- SOLO los mapeos inequívocos (nombre + capacidad coinciden, precio > 0), tomados
-- de las secciones de componentes del Excel (FRASCO SOLO / TAPAS / BOMBA / varillas),
-- que es lo que vende el catálogo. Los ambiguos (tapas con nombre propio, bombas
-- plata/oro, diana/imprisse/paris-50, etc.) quedan para validación de Andrés (#24).
-- Idempotente.

BEGIN;

-- Frascos (sección "FRASCO SOLO")
UPDATE public.products SET price_retail = 690  WHERE id = 'frasco-aerosol-50';
UPDATE public.products SET price_retail = 740  WHERE id = 'frasco-aerosol-100';
UPDATE public.products SET price_retail = 748  WHERE id = 'frasco-argenta-30';
UPDATE public.products SET price_retail = 748  WHERE id = 'frasco-argenta-50';
UPDATE public.products SET price_retail = 1330 WHERE id = 'frasco-argenta-100';
UPDATE public.products SET price_retail = 800  WHERE id = 'frasco-clarisa-50';
UPDATE public.products SET price_retail = 765  WHERE id = 'frasco-lady';
UPDATE public.products SET price_retail = 1003 WHERE id = 'frasco-manzanita-50';
UPDATE public.products SET price_retail = 425  WHERE id = 'frasco-margarita-15';
UPDATE public.products SET price_retail = 807  WHERE id = 'frasco-organic-30';
UPDATE public.products SET price_retail = 1037 WHERE id = 'frasco-paris-100';
UPDATE public.products SET price_retail = 748  WHERE id = 'frasco-vantax-30';
UPDATE public.products SET price_retail = 748  WHERE id = 'frasco-vantax-50';
UPDATE public.products SET price_retail = 730  WHERE id = 'frasco-vial-50';
UPDATE public.products SET price_retail = 650  WHERE id = 'frasco-violeta-30';
UPDATE public.products SET price_retail = 1028 WHERE id = 'frasco-violeta-50';
UPDATE public.products SET price_retail = 1090 WHERE id = 'frasco-julieta-50';
UPDATE public.products SET price_retail = 935  WHERE id = 'frasco-aromas-50';

-- Tapas (matches claros)
UPDATE public.products SET price_retail = 100  WHERE id = 'tapa-formosa';
UPDATE public.products SET price_retail = 80   WHERE id = 'tapa-vantax-15';
UPDATE public.products SET price_retail = 120  WHERE id = 'tapa-argenta';
UPDATE public.products SET price_retail = 80   WHERE id = 'tapa-difusor';

-- Dosificadores / accesorios
UPDATE public.products SET price_retail = 380  WHERE id = 'mini-gatillo';
UPDATE public.products SET price_retail = 70   WHERE id = 'varillas-rattan';

COMMIT;
