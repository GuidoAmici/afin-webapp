BEGIN;

CREATE TABLE public.categories (
  id         text    PRIMARY KEY,
  label      text    NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.subcategories (
  id          text    PRIMARY KEY,
  category_id text    NOT NULL REFERENCES public.categories(id),
  label       text    NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0
);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.products (
  id              text    PRIMARY KEY,
  name            text    NOT NULL,
  category_id     text    NOT NULL REFERENCES public.categories(id),
  subcategory_id  text    NOT NULL REFERENCES public.subcategories(id),
  image           text    NOT NULL,
  images          text[],
  badge           text    NOT NULL DEFAULT 'stock'
                          CHECK (badge = ANY (ARRAY['stock'::text, 'consult'::text, 'new'::text])),
  price_retail    text,
  price_wholesale text,
  description     text,
  sort_order      integer NOT NULL DEFAULT 0,
  active          boolean NOT NULL DEFAULT true
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

COMMIT;
