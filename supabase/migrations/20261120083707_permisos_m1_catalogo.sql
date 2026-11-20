-- Modelo de permisos (M1, catálogo), copiado de New Haze y recortado a lo que
-- AFIN necesita: catálogo, plantillas, asignaciones por usuario y los chequeos.
-- EXPANDIR: sólo objetos nuevos; nada de lo existente llama a estas funciones todavía.
--
--   · acceso_permisos / acceso_plantillas / acceso_plantilla_permisos   catálogo
--   · acceso_asignaciones   lo concedido a cada usuario (una vigente por par; historial)
--   · private.tiene_permiso / usuario_tiene_permiso / mis_permisos
--   · public.mis_permisos / puedo_entrar_panel   lectura propia para la UI y el proxy
--
-- Escritura: ninguna API. Las tablas quedan sin acceso para anon y authenticated
-- (RLS activada, sin políticas); se leen por las funciones.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

-- ── Catálogo ─────────────────────────────────────────────────────────────────
CREATE TABLE public.acceso_permisos (
    clave       text        PRIMARY KEY,
    descripcion text        NOT NULL,
    sensible    boolean     NOT NULL DEFAULT false,
    estado      text        NOT NULL DEFAULT 'activo',
    CONSTRAINT acceso_permisos_clave CHECK (clave ~ '^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$'),
    CONSTRAINT acceso_permisos_descripcion CHECK (char_length(btrim(descripcion)) >= 3),
    CONSTRAINT acceso_permisos_estado CHECK (estado IN ('activo', 'obsoleto'))
);
COMMENT ON TABLE public.acceso_permisos IS
    'Catálogo de permisos. La clave es un contrato: se agrega, nunca se renombra.';

CREATE TABLE public.acceso_plantillas (
    clave       text PRIMARY KEY,
    descripcion text NOT NULL
);

CREATE TABLE public.acceso_plantilla_permisos (
    plantilla text NOT NULL REFERENCES public.acceso_plantillas(clave) ON DELETE CASCADE,
    permiso   text NOT NULL REFERENCES public.acceso_permisos(clave),
    PRIMARY KEY (plantilla, permiso)
);

-- ── Asignaciones por usuario ─────────────────────────────────────────────────
CREATE TABLE public.acceso_asignaciones (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permiso      text        NOT NULL REFERENCES public.acceso_permisos(clave),
    otorgado_por uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    otorgado_en  timestamptz NOT NULL DEFAULT now(),
    vence_en     timestamptz,
    revocado_en  timestamptz,
    CONSTRAINT acceso_asignaciones_vence CHECK (vence_en IS NULL OR vence_en > otorgado_en)
);
COMMENT ON TABLE public.acceso_asignaciones IS
    'Permisos concedidos a cada usuario. Revocar = marcar revocado_en (no se borra). Vigente = no revocada y no vencida; el vencimiento se evalúa al leer.';

CREATE UNIQUE INDEX acceso_asignaciones_activa_key
    ON public.acceso_asignaciones (user_id, permiso) WHERE revocado_en IS NULL;
CREATE INDEX acceso_asignaciones_permiso_idx ON public.acceso_asignaciones (permiso);

-- ── Chequeos ─────────────────────────────────────────────────────────────────
-- Falla cerrado: sin sesión, permiso inexistente/obsoleto, asignación revocada o
-- vencida => false. Nunca devuelve NULL (EXISTS).
CREATE FUNCTION private.tiene_permiso(p_permiso text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.acceso_asignaciones a
        JOIN public.acceso_permisos c ON c.clave = a.permiso AND c.estado = 'activo'
        WHERE a.user_id = (SELECT auth.uid())
          AND a.permiso = p_permiso
          AND a.revocado_en IS NULL
          AND (a.vence_en IS NULL OR a.vence_en > now()))
$$;

-- Igual, con usuario explícito (para código que corre sin sesión). Sin acceso desde la API.
CREATE FUNCTION private.usuario_tiene_permiso(p_user uuid, p_permiso text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.acceso_asignaciones a
        JOIN public.acceso_permisos c ON c.clave = a.permiso AND c.estado = 'activo'
        WHERE a.user_id = p_user
          AND a.permiso = p_permiso
          AND a.revocado_en IS NULL
          AND (a.vence_en IS NULL OR a.vence_en > now()))
$$;

CREATE FUNCTION private.mis_permisos() RETURNS text[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT COALESCE(array_agg(a.permiso ORDER BY a.permiso), '{}'::text[])
    FROM public.acceso_asignaciones a
    JOIN public.acceso_permisos c ON c.clave = a.permiso AND c.estado = 'activo'
    WHERE a.user_id = (SELECT auth.uid())
      AND a.revocado_en IS NULL
      AND (a.vence_en IS NULL OR a.vence_en > now())
$$;

CREATE FUNCTION public.mis_permisos() RETURNS text[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT private.mis_permisos() $$;
COMMENT ON FUNCTION public.mis_permisos() IS
    'Permisos vigentes del que llama (los suyos, nada más).';

CREATE FUNCTION public.puedo_entrar_panel() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT private.tiene_permiso('equipo:acceder') $$;
COMMENT ON FUNCTION public.puedo_entrar_panel() IS
    'Si el que llama puede entrar al panel (permiso equipo:acceder vigente). La usa el proxy de la webapp.';

REVOKE ALL ON FUNCTION private.tiene_permiso(text), private.mis_permisos(),
    public.mis_permisos(), public.puedo_entrar_panel() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.tiene_permiso(text), private.mis_permisos(),
    public.mis_permisos(), public.puedo_entrar_panel() TO authenticated;

REVOKE ALL ON FUNCTION private.usuario_tiene_permiso(uuid, text) FROM PUBLIC, anon, authenticated;

-- ── RLS y privilegios: nadie escribe ni lee directo; se lee por las funciones ─
ALTER TABLE public.acceso_permisos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceso_plantillas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceso_plantilla_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceso_asignaciones       ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.acceso_permisos, public.acceso_plantillas,
              public.acceso_plantilla_permisos, public.acceso_asignaciones
    FROM PUBLIC, anon, authenticated;

-- ── Siembra ──────────────────────────────────────────────────────────────────
-- Las descripciones de las claves que existen en New Haze son las suyas.
INSERT INTO public.acceso_permisos (clave, descripcion, sensible) VALUES
    ('equipo:acceder',       'Ser parte del equipo: entrar al panel y a las herramientas internas.', false),
    ('pedidos:ver',          'Ver los pedidos de venta y sus líneas.', false),
    ('pedidos:editar',       'Crear, modificar y borrar pedidos de venta y sus líneas.', false),
    ('pedidos:corregir',     'Corregir un pedido ya avanzado de estado.', true),
    ('usuarios:ver',         'Buscar a cualquier usuario y ver su email y sus datos personales.', true),
    ('configuracion:editar', 'Cambiar la configuración del sistema.', true),
    ('finanzas:ver',         'Ver los comprobantes fiscales y los datos de facturación.', true),
    ('finanzas:cargar',      'Cargar comprobantes fiscales.', true);

INSERT INTO public.acceso_plantillas (clave, descripcion) VALUES
    ('operario',      'Entrar al panel y ver pedidos.'),
    ('encargado',     'Operario más edición de pedidos y ver usuarios.'),
    ('administrador', 'Todos los permisos.');

INSERT INTO public.acceso_plantilla_permisos (plantilla, permiso) VALUES
    ('operario', 'equipo:acceder'),
    ('operario', 'pedidos:ver'),
    ('encargado', 'equipo:acceder'),
    ('encargado', 'pedidos:ver'),
    ('encargado', 'pedidos:editar'),
    ('encargado', 'usuarios:ver');
INSERT INTO public.acceso_plantilla_permisos (plantilla, permiso)
    SELECT 'administrador', clave FROM public.acceso_permisos;
