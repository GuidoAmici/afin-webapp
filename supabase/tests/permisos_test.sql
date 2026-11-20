-- pgTAP: modelo de permisos (M1, catálogo): tiene_permiso, mis_permisos,
-- puedo_entrar_panel y privilegios. Corre con `supabase test db` (stack local).

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

BEGIN;
SELECT plan(18);

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('a1a1a1a1-0000-0000-0000-000000000001', 'perm-sin@test.dev',      '{}'::jsonb),
  ('a1a1a1a1-0000-0000-0000-000000000002', 'perm-con@test.dev',      '{}'::jsonb),
  ('a1a1a1a1-0000-0000-0000-000000000003', 'perm-revocado@test.dev', '{}'::jsonb),
  ('a1a1a1a1-0000-0000-0000-000000000004', 'perm-vencido@test.dev',  '{}'::jsonb),
  ('a1a1a1a1-0000-0000-0000-000000000005', 'perm-obsoleto@test.dev', '{}'::jsonb);

-- Un permiso obsoleto de prueba, sólo dentro de la transacción.
INSERT INTO public.acceso_permisos (clave, descripcion, estado)
VALUES ('prueba:obsoleto', 'permiso obsoleto de prueba', 'obsoleto');

INSERT INTO public.acceso_asignaciones (user_id, permiso, revocado_en, vence_en, otorgado_en) VALUES
  ('a1a1a1a1-0000-0000-0000-000000000002', 'finanzas:ver',    NULL, NULL, now()),
  ('a1a1a1a1-0000-0000-0000-000000000002', 'equipo:acceder',  NULL, NULL, now()),
  ('a1a1a1a1-0000-0000-0000-000000000003', 'finanzas:ver',    now(), NULL, now() - interval '2 days'),
  ('a1a1a1a1-0000-0000-0000-000000000004', 'finanzas:ver',    NULL, now() - interval '1 hour', now() - interval '2 days'),
  ('a1a1a1a1-0000-0000-0000-000000000005', 'prueba:obsoleto', NULL, NULL, now());

-- ── Catálogo y plantillas ────────────────────────────────────────────────
SELECT results_eq($$ SELECT clave FROM public.acceso_permisos WHERE clave <> 'prueba:obsoleto' ORDER BY clave $$,
  $$ VALUES ('configuracion:editar'), ('equipo:acceder'), ('finanzas:cargar'), ('finanzas:ver'),
            ('pedidos:corregir'), ('pedidos:editar'), ('pedidos:ver'), ('usuarios:ver') $$,
  'el catálogo trae los 8 permisos');
SELECT results_eq($$ SELECT permiso FROM public.acceso_plantilla_permisos WHERE plantilla = 'operario' ORDER BY permiso $$,
  $$ VALUES ('equipo:acceder'), ('pedidos:ver') $$, 'operario = equipo:acceder y pedidos:ver');
SELECT results_eq($$ SELECT permiso FROM public.acceso_plantilla_permisos WHERE plantilla = 'encargado' ORDER BY permiso $$,
  $$ VALUES ('equipo:acceder'), ('pedidos:editar'), ('pedidos:ver'), ('usuarios:ver') $$,
  'encargado = operario + pedidos:editar y usuarios:ver');
SELECT is((SELECT count(*)::int FROM public.acceso_plantilla_permisos WHERE plantilla = 'administrador'),
  (SELECT count(*)::int FROM public.acceso_permisos WHERE clave <> 'prueba:obsoleto'),
  'administrador tiene todos');

-- ── tiene_permiso / usuario_tiene_permiso ────────────────────────────────
SELECT set_config('request.jwt.claim.sub', 'a1a1a1a1-0000-0000-0000-000000000001', true);
SET LOCAL ROLE authenticated;
SELECT is(private.tiene_permiso('finanzas:ver'), false, 'sin asignación: false');
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'a1a1a1a1-0000-0000-0000-000000000002', true);
SET LOCAL ROLE authenticated;
SELECT is(private.tiene_permiso('finanzas:ver'), true, 'con asignación: true');
SELECT is(public.puedo_entrar_panel(), true, 'puedo_entrar_panel con equipo:acceder');
SELECT is(public.mis_permisos(), ARRAY['equipo:acceder', 'finanzas:ver'], 'mis_permisos devuelve los vigentes');
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'a1a1a1a1-0000-0000-0000-000000000003', true);
SET LOCAL ROLE authenticated;
SELECT is(private.tiene_permiso('finanzas:ver'), false, 'revocado: false');
SELECT is(public.puedo_entrar_panel(), false, 'puedo_entrar_panel sin equipo:acceder: false');
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'a1a1a1a1-0000-0000-0000-000000000004', true);
SET LOCAL ROLE authenticated;
SELECT is(private.tiene_permiso('finanzas:ver'), false, 'vencido: false');
SELECT is(public.mis_permisos(), '{}'::text[], 'mis_permisos excluye los vencidos');
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'a1a1a1a1-0000-0000-0000-000000000005', true);
SET LOCAL ROLE authenticated;
SELECT is(private.tiene_permiso('prueba:obsoleto'), false, 'permiso obsoleto: false');
RESET ROLE;

SELECT is(private.usuario_tiene_permiso('a1a1a1a1-0000-0000-0000-000000000002', 'finanzas:ver'), true,
  'usuario_tiene_permiso: true con asignación');
SELECT is(private.usuario_tiene_permiso('a1a1a1a1-0000-0000-0000-000000000004', 'finanzas:ver'), false,
  'usuario_tiene_permiso: false si venció');

-- ── Privilegios ──────────────────────────────────────────────────────────
SET LOCAL ROLE anon;
SELECT throws_ok($$ SELECT public.mis_permisos() $$, '42501', NULL, 'anon no ejecuta public.mis_permisos()');
SELECT throws_ok($$ SELECT public.puedo_entrar_panel() $$, '42501', NULL, 'anon no ejecuta public.puedo_entrar_panel()');
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT throws_ok($$ INSERT INTO public.acceso_asignaciones (user_id, permiso)
  VALUES ('a1a1a1a1-0000-0000-0000-000000000001', 'finanzas:ver') $$,
  '42501', NULL, 'authenticated no inserta en acceso_asignaciones');
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
