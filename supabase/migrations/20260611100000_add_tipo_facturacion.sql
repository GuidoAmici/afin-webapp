ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tipo_facturacion TEXT NOT NULL DEFAULT 'personal'
    CHECK (tipo_facturacion IN ('personal', 'empresa'));
