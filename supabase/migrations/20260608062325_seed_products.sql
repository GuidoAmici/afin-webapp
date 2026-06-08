BEGIN;

INSERT INTO public.products (id, name, category_id, subcategory_id, image, images, badge, price_retail, price_wholesale, description, sort_order, active) VALUES

-- Accesorios
('medidor',            'Medidor / Vaso',            'accesorios', 'medicion',  '/images/products/vaso-medidor-remedio.jpg',      NULL,                                                                                                              'consult', NULL, NULL, 'Vaso medidor tipo medicinal.',                                        0, true),
('varillas-rattan',    'Varillas de Rattan',        'accesorios', 'rattan',    '/images/products/accesorios-rattan.jpg',          NULL,                                                                                                              'consult', NULL, NULL, 'Varillas de rattan para difusores de aromas.',                        0, true),
('elementos-engrimpar','Elementos para Engrimpar',  'accesorios', 'engrimpar', '/images/products/accesorios-engrimpar.png',       NULL,                                                                                                              'consult', NULL, NULL, 'Herramientas y accesorios para el proceso de engrimpe.',              0, true),

-- Dosificadores
('bomba-15-plata',  'Bomba 15 mm (Plateada)',   'dosificadores', 'bomba-15', '/images/products/Bomba-15-Plata-plata-.jpg',    ARRAY['/images/products/Bomba-15-Plata-plata-.jpg', '/images/products/Bomba-15-oro-oro-.jpg'],                      'stock',   NULL, NULL, NULL,                                                                  0, true),
('bomba-20-plata',  'Bomba 20 mm (Plateada)',   'dosificadores', 'bomba-20', '/images/products/Bomba-20-plata-plata-.jpg',    NULL,                                                                                                              'stock',   NULL, NULL, NULL,                                                                  0, true),
('bomba-spray-sin', 'Bomba Spray 24 s/tapa',    'dosificadores', 'bomba-20', '/images/products/bomba-spray-24-sin.jpg',       NULL,                                                                                                              'stock',   NULL, NULL, NULL,                                                                  1, true),
('bomba-15-oro',    'Bomba 15 mm (Oro)',         'dosificadores', 'bomba-15', '/images/products/Bomba-15-oro-oro-.jpg',        NULL,                                                                                                              'stock',   NULL, NULL, NULL,                                                                  1, true),
('bomba-spray-con', 'Bomba Spray 24 c/tapa',    'dosificadores', 'bomba-20', '/images/products/bomba-spray-24-tapa.jpg',      NULL,                                                                                                              'stock',   NULL, NULL, NULL,                                                                  2, true),
('mini-gatillo',    'Mini Gatillo 24',           'dosificadores', 'bomba-20', '/images/products/mini-gatillo-24.jpg',          NULL,                                                                                                              'stock',   NULL, NULL, NULL,                                                                  3, true),

-- Envases
('vidrio-clio',    'Clio (vidrio)',    'envases', 'vidrio', '/images/products/clio.jpg',   NULL, 'consult', NULL, NULL, NULL,                                                                               0, true),
('vidrio-generico', 'Envase de vidrio','envases', 'vidrio', '/images/products/vidrio.jpg', NULL, 'consult', NULL, NULL, 'Amplia variedad de envases de vidrio. Consultá por modelos disponibles.', 1, true),

-- Frascos 10-20 ml
('frasco-sampling',     'Sampling 12 ml',        'frascos', 'frascos-10-20', '/images/products/SAMPLIG-12ML-1.jpg',           NULL, 'stock', NULL, NULL, NULL,                         0, true),
('frasco-margarita-15', 'Frasco Margarita 15 ml','frascos', 'frascos-10-20', '/images/products/frasco-margarita-15.jpg',      NULL, 'stock', NULL, NULL, NULL,                         1, true),
('frasco-perfumero-20', 'Perfumero 20 ml',       'frascos', 'frascos-10-20', '/images/products/Perfumero-20ml-rosca-C.png',   NULL, 'stock', NULL, NULL, 'Perfumero 20 ml. Rosca tipo C.', 2, true),
('frasco-rollon',       'Roll-on',               'frascos', 'frascos-10-20', '/images/products/roll-on.jpg',                  NULL, 'stock', NULL, NULL, NULL,                         3, true),

-- Frascos 30 ml
('frasco-argenta-30', 'Argenta 30 ml', 'frascos', 'frascos-30', '/images/products/argenta-30.jpg', NULL, 'stock', NULL, NULL, NULL,                               0, true),
('frasco-organic-30', 'Organic 30 ml', 'frascos', 'frascos-30', '/images/products/organic-30.jpg', NULL, 'stock', NULL, NULL, NULL,                               1, true),
('frasco-violeta-30', 'Violeta 30 ml', 'frascos', 'frascos-30', '/images/products/Violeta-30ml-boca-20.jpg', NULL, 'stock', NULL, NULL, 'Frasco Violeta 30 ml, boca 20 mm.', 2, true),
('frasco-vantax-30',  'Vantax 30 ml',  'frascos', 'frascos-30', '/images/products/vantax-30.jpg',  NULL, 'stock', NULL, NULL, NULL,                               3, true),

-- Frascos 50-60 ml
('frasco-aromas-50',   'Aromas 50 ml',    'frascos', 'frascos-50-60', '/images/products/Aromas-50ml-boca-15-.jpg',    NULL, 'stock', NULL, NULL, 'Frasco Aromas 50 ml, boca 15 mm.',   0, true),
('frasco-clarisa-50',  'Clarisa 50 ml',   'frascos', 'frascos-50-60', '/images/products/Clarisa-50ml-boca-15-1.jpg',  NULL, 'stock', NULL, NULL, 'Frasco Clarisa 50 ml, boca 15 mm.',  1, true),
('frasco-julieta-50',  'Julieta 50 ml',   'frascos', 'frascos-50-60', '/images/products/Julieta-50ml-boca-15.jpg',    NULL, 'stock', NULL, NULL, 'Frasco Julieta 50 ml, boca 15 mm.',  2, true),
('frasco-violeta-50',  'Violeta 50 ml',   'frascos', 'frascos-50-60', '/images/products/Violeta-50ml-boca-20-1.jpg',  NULL, 'stock', NULL, NULL, 'Frasco Violeta 50 ml, boca 20 mm.',  3, true),
('frasco-copa',        'Copa',            'frascos', 'frascos-50-60', '/images/products/copa.jpg',                    NULL, 'stock', NULL, NULL, NULL,                                  4, true),
('frasco-justin-50',   'Justin 50 ml',    'frascos', 'frascos-50-60', '/images/products/justin-50.jpg',               NULL, 'stock', NULL, NULL, NULL,                                  5, true),
('frasco-lady',        'Lady',            'frascos', 'frascos-50-60', '/images/products/lady.jpg',                    NULL, 'stock', NULL, NULL, NULL,                                  6, true),
('frasco-manzanita-50','Manzanita 50 ml', 'frascos', 'frascos-50-60', '/images/products/manzanita-50.jpg',            NULL, 'stock', NULL, NULL, NULL,                                  7, true),
('frasco-paris-50',    'Paris 50 ml',     'frascos', 'frascos-50-60', '/images/products/paris-50.jpg',                NULL, 'stock', NULL, NULL, NULL,                                  8, true),
('frasco-rio',         'Río',             'frascos', 'frascos-50-60', '/images/products/rio.jpg',                     NULL, 'stock', NULL, NULL, NULL,                                  9, true),
('frasco-vantax-50',   'Vantax 50 ml',    'frascos', 'frascos-50-60', '/images/products/vantax-50.jpg',               NULL, 'stock', NULL, NULL, NULL,                                  10, true),
('frasco-vial-50',     'Vial 50 ml',      'frascos', 'frascos-50-60', '/images/products/vial-50-2.jpg',               NULL, 'stock', NULL, NULL, NULL,                                  11, true),
('frasco-wada-50',     'Pote Wada 50 ml', 'frascos', 'frascos-50-60', '/images/products/POTE-WADA-50ML.jpg',          NULL, 'stock', NULL, NULL, NULL,                                  12, true),
('frasco-ecuatone-60', 'Ecuatone 60 ml',  'frascos', 'frascos-50-60', '/images/products/Ecuatone-60ml-rosca-18-.jpg', NULL, 'stock', NULL, NULL, 'Frasco Ecuatone 60 ml. Rosca 18 mm.', 13, true),
('frasco-argenta-50',  'Argenta 50 ml',   'frascos', 'frascos-50-60', '/images/products/argenta-50.jpg',              NULL, 'stock', NULL, NULL, NULL,                                  14, true),
('frasco-aerosol-50',  'Aerosol 50 ml',   'frascos', 'frascos-50-60', '/images/products/aerosol-50.jpg',              NULL, 'stock', NULL, NULL, NULL,                                  15, true),

-- Frascos 100 ml+
('frasco-argenta-100',    'Argenta 100 ml',    'frascos', 'frascos-100', '/images/products/argenta-100.jpg',          NULL, 'stock', NULL, NULL, NULL,                                0, true),
('frasco-diana-100',      'Diana 100 ml',      'frascos', 'frascos-100', '/images/products/DIANA-100ML-boca-20-1.jpg',NULL, 'stock', NULL, NULL, 'Frasco Diana 100 ml, boca 20 mm.', 1, true),
('frasco-imprisse-100',   'Imprisse 100 ml',   'frascos', 'frascos-100', '/images/products/imprisse-100.jpg',         NULL, 'stock', NULL, NULL, NULL,                                2, true),
('frasco-just-100',       'Just 100 ml',       'frascos', 'frascos-100', '/images/products/just-100.jpg',             NULL, 'stock', NULL, NULL, NULL,                                3, true),
('frasco-level-100',      'Level 100 ml',      'frascos', 'frascos-100', '/images/products/LEVEL-100-A.jpg',          NULL, 'stock', NULL, NULL, NULL,                                4, true),
('frasco-transparente-100','Transparente 100 ml','frascos','frascos-100', '/images/products/transparente.jpg',         NULL, 'stock', NULL, NULL, NULL,                                5, true),
('frasco-time-125',       'Time 125 ml',       'frascos', 'frascos-100', '/images/products/Time-125.jpg',             NULL, 'stock', NULL, NULL, NULL,                                6, true),
('frasco-paris-100',      'Paris 100 ml',      'frascos', 'frascos-100', '/images/products/paris-100.jpg',            NULL, 'stock', NULL, NULL, NULL,                                7, true),
('frasco-aerosol-100',    'Aerosol 100 ml',    'frascos', 'frascos-100', '/images/products/aerosol-100.jpg',          NULL, 'stock', NULL, NULL, NULL,                                8, true),

-- Tapas engrimpe 15 mm
('tapa-tubo',        'Tapa Tubo',    'tapas', 'engrimpe-15', '/images/products/tapa-tubo.jpg',         ARRAY['/images/products/tuboplateada.png', '/images/products/tapa-tubo.jpg'], 'stock', NULL, NULL, 'Tapa tubo para válvula de engrimpe 15 mm. Disponible en varios colores.', 0, true),
('tapa-prisma',      'Tapa Prisma',  'tapas', 'engrimpe-15', '/images/products/prisma-50-varios.jpg',  NULL, 'stock', NULL, NULL, 'Tapa Prisma para engrimpe 15 mm. Disponible en varios colores.',          1, true),
('tapa-vantax-15',   'Tapa Vantax',  'tapas', 'engrimpe-15', '/images/products/tapa-vantax.jpg',       NULL, 'stock', NULL, NULL, NULL,                                                                       2, true),
('tapa-mirita',      'Tapa Mirita',  'tapas', 'engrimpe-15', '/images/products/tapa-mirita-rojo.jpg',  NULL, 'stock', NULL, NULL, NULL,                                                                       3, true),
('tapa-bolita',      'Tapa Bolita',  'tapas', 'engrimpe-15', '/images/products/tapa-bolita-cubre-bombba.jpg', NULL, 'stock', NULL, NULL, 'Tapa bolita cubre bomba para engrimpe 15 mm.',                     4, true),
('tapa-flor',        'Tapa Flor',    'tapas', 'engrimpe-15', '/images/products/tapa-flor.jpg',         NULL, 'stock', NULL, NULL, NULL,                                                                       5, true),
('tapa-hoja',        'Tapa Hoja',    'tapas', 'engrimpe-15', '/images/products/tapa-hoja.jpg',         NULL, 'stock', NULL, NULL, NULL,                                                                       6, true),
('tapa-margarita-15','Tapa Margarita','tapas','engrimpe-15', '/images/products/tapa-margarita-15.jpg', NULL, 'stock', NULL, NULL, NULL,                                                                       7, true),
('tapa-napoleon',    'Tapa Napoleón','tapas', 'engrimpe-15', '/images/products/tapa-napoleon.jpg',     NULL, 'stock', NULL, NULL, NULL,                                                                       8, true),
('tapa-rusia',       'Tapa Rusia',   'tapas', 'engrimpe-15', '/images/products/tapa-rusia.jpg',        NULL, 'stock', NULL, NULL, NULL,                                                                       9, true),

-- Tapas engrimpe 20 mm
('tapa-formosa',   'Tapa Formosa',    'tapas', 'engrimpe-20', '/images/products/Tapa-Formosa.jpg',    NULL, 'stock', NULL, NULL, NULL, 0, true),
('tapa-gaspy',     'Tapa Gaspy',      'tapas', 'engrimpe-20', '/images/products/tapa-gaspy.jpg',      NULL, 'stock', NULL, NULL, NULL, 1, true),
('tapa-luli',      'Tapa Luli',       'tapas', 'engrimpe-20', '/images/products/tapa-luli.jpg',       NULL, 'stock', NULL, NULL, NULL, 2, true),
('tapa-denise-50', 'Tapa Denise 50',  'tapas', 'engrimpe-20', '/images/products/tapa-denise-50.jpg', NULL, 'stock', NULL, NULL, NULL, 3, true),
('tapa-denise-30', 'Tapa Denise 30',  'tapas', 'engrimpe-20', '/images/products/tapa-denise-30.jpg', NULL, 'stock', NULL, NULL, NULL, 4, true),
('tapa-argenta',   'Tapa Argenta 100','tapas', 'engrimpe-20', '/images/products/tapa-Argenta-100.jpg',NULL,'stock', NULL, NULL, NULL, 5, true),

-- Tapas rosca
('tapa-precinto',     'Tapa Precinto Blanca','tapas', 'rosca-28', '/images/products/tapa-precinto-blanca.jpg', NULL, 'stock', NULL, NULL, NULL,                                          0, true),
('tapa-difusor',      'Tapa Difusor',        'tapas', 'rosca-24', '/images/products/tapa-difusor.jpg',         NULL, 'stock', NULL, NULL, 'Tapa para difusor de varillas. Medida de rosca: 24/410.', 0, true),
('tapa-difusor-ciega','Tapa Difusor Ciega',  'tapas', 'rosca-24', '/images/products/tapa-difusor-ciega.jpg',   NULL, 'stock', NULL, NULL, 'Tapa ciega para difusor de varillas. Medida de rosca: 24/410.', 1, true)
ON CONFLICT (id) DO NOTHING;

COMMIT;
