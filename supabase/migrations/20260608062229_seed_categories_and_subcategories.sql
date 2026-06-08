INSERT INTO public.categories (id, label, sort_order) VALUES
  ('tapas',          'Tapas · Cierres',    0),
  ('dosificadores',  'Dosificadores',      1),
  ('frascos',        'Frascos completos',  2),
  ('envases',        'Envases',            3),
  ('accesorios',     'Accesorios',         4);

INSERT INTO public.subcategories (id, category_id, label, sort_order) VALUES
  ('engrimpe-15', 'tapas',         'Engrimpe 15 mm',      0),
  ('engrimpe-20', 'tapas',         'Engrimpe 20 mm',      1),
  ('rosca-28',    'tapas',         'Rosca 28',            2),
  ('rosca-24',    'tapas',         'Rosca 24/410',        3),
  ('bomba-15',    'dosificadores', 'Bomba 15 mm',         0),
  ('bomba-20',    'dosificadores', 'Bomba 20 mm / Spray', 1),
  ('frascos-10-20', 'frascos',     '10 – 20 ml',          0),
  ('frascos-30',  'frascos',       '30 ml',               1),
  ('frascos-50-60', 'frascos',     '50 – 60 ml',          2),
  ('frascos-100', 'frascos',       '100 ml+',             3),
  ('vidrio',      'envases',       'De vidrio',           0),
  ('plastico',    'envases',       'De plástico',         1),
  ('medicion',    'accesorios',    'Medición',            0),
  ('rattan',      'accesorios',    'Varillas de rattan',  1),
  ('engrimpar',   'accesorios',    'Para engrimpar',      2);
