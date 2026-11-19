-- Usuarios de prueba del stack LOCAL (supabase start / db reset). Nunca se aplica a stg ni prod.
-- Contraseña '123' en los tres; el rol va en raw_app_meta_data.role (lo que lee proxy.ts).
-- UUIDs fijos: el seed es determinístico. Las columnas *_token van en '' porque
-- con NULL GoTrue falla el login.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated',
  'cliente@test.com', extensions.crypt('123', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"],"role":"cliente"}',
  '{"full_name":"Cliente de prueba"}', now(), now(),
  '', '', '', '', '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(), '11111111-1111-4111-8111-111111111111', 'email', '11111111-1111-4111-8111-111111111111',
  '{"sub":"11111111-1111-4111-8111-111111111111","email":"cliente@test.com","email_verified":true}', now(), now(), now()
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated',
  'empleado@test.com', extensions.crypt('123', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"],"role":"empleado"}',
  '{"full_name":"Empleado de prueba"}', now(), now(),
  '', '', '', '', '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(), '22222222-2222-4222-8222-222222222222', 'email', '22222222-2222-4222-8222-222222222222',
  '{"sub":"22222222-2222-4222-8222-222222222222","email":"empleado@test.com","email_verified":true}', now(), now(), now()
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated',
  'admin@test.com', extensions.crypt('123', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"],"role":"admin"}',
  '{"full_name":"Admin de prueba"}', now(), now(),
  '', '', '', '', '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(), '33333333-3333-4333-8333-333333333333', 'email', '33333333-3333-4333-8333-333333333333',
  '{"sub":"33333333-3333-4333-8333-333333333333","email":"admin@test.com","email_verified":true}', now(), now(), now()
);

