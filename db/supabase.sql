create table public.regimenes_patronales (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entidades_federativas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  regimen_patronal_id uuid not null
    references public.regimenes_patronales (id)
    on update cascade
    on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.colaboradores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  puesto text not null,
  codigo_interno text not null,
  f_ingreso date not null,
  nss_imss text not null,
  curp text not null,
  rfc text not null,
  vigencia date not null,
  foto_url text not null,
  entidad_federativa_id uuid not null
    references public.entidades_federativas (id)
    on update cascade
    on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.regimenes_patronales enable row level security;
alter table public.entidades_federativas enable row level security;
alter table public.colaboradores enable row level security;

revoke all on table
  public.regimenes_patronales,
  public.entidades_federativas,
  public.colaboradores
from public, anon, authenticated;

grant select, insert, update, delete on table
  public.regimenes_patronales,
  public.entidades_federativas,
  public.colaboradores
to authenticated;

drop policy if exists "Usuarios autenticados pueden consultar (select) regimenes patronales"
  on public.regimenes_patronales;
create policy "Usuarios autenticados pueden consultar (select) regimenes patronales"
  on public.regimenes_patronales
  for select to authenticated
  using (true);

drop policy if exists "Usuarios autenticados pueden crear (insert) regimenes patronales"
  on public.regimenes_patronales;
create policy "Usuarios autenticados pueden crear (insert) regimenes patronales"
  on public.regimenes_patronales
  for insert to authenticated
  with check (true);

drop policy if exists "Usuarios autenticados pueden editar (update) regimenes patronales"
  on public.regimenes_patronales;
create policy "Usuarios autenticados pueden editar (update) regimenes patronales"
  on public.regimenes_patronales
  for update to authenticated
  using (true)
  with check (true);

drop policy if exists "Usuarios autenticados pueden eliminar (delete) regimenes patronales"
  on public.regimenes_patronales;
create policy "Usuarios autenticados pueden eliminar (delete) regimenes patronales"
  on public.regimenes_patronales
  for delete to authenticated
  using (true);

drop policy if exists "Usuarios autenticados pueden consultar (select) entidades federativas"
  on public.entidades_federativas;
create policy "Usuarios autenticados pueden consultar (select) entidades federativas"
  on public.entidades_federativas
  for select to authenticated
  using (true);

drop policy if exists "Usuarios autenticados pueden crear (insert) entidades federativas"
  on public.entidades_federativas;
create policy "Usuarios autenticados pueden crear (insert) entidades federativas"
  on public.entidades_federativas
  for insert to authenticated
  with check (true);

drop policy if exists "Usuarios autenticados pueden editar (update) entidades federativas"
  on public.entidades_federativas;
create policy "Usuarios autenticados pueden editar (update) entidades federativas"
  on public.entidades_federativas
  for update to authenticated
  using (true)
  with check (true);

drop policy if exists "Usuarios autenticados pueden eliminar (delete) entidades federativas"
  on public.entidades_federativas;
create policy "Usuarios autenticados pueden eliminar (delete) entidades federativas"
  on public.entidades_federativas
  for delete to authenticated
  using (true);

drop policy if exists "Usuarios autenticados pueden consultar (select) colaboradores"
  on public.colaboradores;
create policy "Usuarios autenticados pueden consultar (select) colaboradores"
  on public.colaboradores
  for select to authenticated
  using (true);

drop policy if exists "Usuarios autenticados pueden crear (insert) colaboradores"
  on public.colaboradores;
create policy "Usuarios autenticados pueden crear (insert) colaboradores"
  on public.colaboradores
  for insert to authenticated
  with check (true);

drop policy if exists "Usuarios autenticados pueden editar (update) colaboradores"
  on public.colaboradores;
create policy "Usuarios autenticados pueden editar (update) colaboradores"
  on public.colaboradores
  for update to authenticated
  using (true)
  with check (true);

drop policy if exists "Usuarios autenticados pueden eliminar (delete) colaboradores"
  on public.colaboradores;
create policy "Usuarios autenticados pueden eliminar (delete) colaboradores"
  on public.colaboradores
  for delete to authenticated
  using (true);

create or replace function public.obtener_colaborador_publico(p_id uuid)
returns table (
  id uuid,
  nombre text,
  puesto text,
  codigo_interno text,
  f_ingreso date,
  nss_imss text,
  curp text,
  rfc text,
  vigencia date,
  foto_url text,
  entidad_federativa text,
  regimen_patronal text
)
language sql
security definer
stable
set search_path = ''
as $$
  SELECT
    c.id,
    c.nombre,
    c.puesto,
    c.codigo_interno,
    c.f_ingreso,
    c.nss_imss,
    c.curp,
    c.rfc,
    c.vigencia,
    c.foto_url,
    e.nombre AS entidad_federativa,
    r.clave AS regimen_patronal
  FROM public.colaboradores AS c, public.entidades_federativas AS e, public.regimenes_patronales AS r
  WHERE c.id = p_id AND c.entidad_federativa_id = e.id AND e.regimen_patronal_id = r.id;
$$;

revoke all on function public.obtener_colaborador_publico(uuid)
  from public, anon, authenticated;
grant execute on function public.obtener_colaborador_publico(uuid)
  to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('colaboradores', 'colaboradores', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Usuarios autenticados pueden subir (upload) fotos de colaboradores"
  on storage.objects;
create policy "Usuarios autenticados pueden subir (upload) fotos de colaboradores"
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'colaboradores'
    and (storage.foldername(name))[1] = 'fotos'
  );

drop policy if exists "Usuarios autenticados pueden eliminar (delete) fotos de colaboradores"
  on storage.objects;
create policy "Usuarios autenticados pueden eliminar (delete) fotos de colaboradores"
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'colaboradores'
    and (storage.foldername(name))[1] = 'foto'
  );
