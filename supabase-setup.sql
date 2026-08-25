-- =========================================================
-- El Extraño José — configuración de Supabase
-- Corre esto una sola vez en: Supabase → SQL Editor → New query
-- =========================================================

-- ---------- perfiles (rol cliente / staff) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'cliente' check (role in ('cliente','staff')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- crea el perfil automáticamente cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'cliente')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- menú ----------
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Buenos días',
  icon text not null default 'coffee',
  price numeric not null default 0,
  description text default '',
  image_url text default '',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- si ya tenías la tabla de una versión anterior, esto agrega las columnas nuevas sin borrar nada
alter table public.menu_items add column if not exists icon text not null default 'coffee';
alter table public.menu_items add column if not exists featured boolean not null default false;

alter table public.menu_items enable row level security;

create policy "Anyone can view menu"
  on public.menu_items for select
  using (true);

create policy "Staff can insert menu items"
  on public.menu_items for insert
  with check (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'staff'
  ));

create policy "Staff can update menu items"
  on public.menu_items for update
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'staff'
  ));

create policy "Staff can delete menu items"
  on public.menu_items for delete
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'staff'
  ));

-- ---------- fotos placeholder del sitio ----------
create table if not exists public.site_images (
  key text primary key,
  url text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_images enable row level security;

create policy "Anyone can view site images"
  on public.site_images for select
  using (true);

create policy "Staff can update site images"
  on public.site_images for update
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'staff'
  ));

-- filas base (la página hace UPDATE, no INSERT, así que deben existir de antemano)
-- Vienen precargadas con fotos de stock (Unsplash, licencia libre) para que el
-- sitio se vea completo desde el día uno. Reemplázalas cuando tengas fotos reales.
insert into public.site_images (key, url) values
  ('hero','https://images.unsplash.com/photo-1758900450186-e829f72d25fb?q=80&w=1000&auto=format&fit=crop'),
  ('founder','https://images.unsplash.com/photo-1758593386033-cb1f842d550c?q=80&w=1000&auto=format&fit=crop'),
  ('azotea','https://images.unsplash.com/photo-1747269843293-6a2e25b068e3?q=80&w=1200&auto=format&fit=crop'),
  ('gallery-0','https://images.unsplash.com/photo-1681112035110-105b148f0a9a?q=80&w=900&auto=format&fit=crop'),
  ('gallery-1','https://images.unsplash.com/photo-1758945185175-3d54780cd8d0?q=80&w=900&auto=format&fit=crop'),
  ('gallery-2','https://images.unsplash.com/photo-1712265964629-6cb2c90f9e48?q=80&w=900&auto=format&fit=crop'),
  ('map','')
on conflict (key) do nothing;

-- ---------- menú de ejemplo (bórralo o edítalo desde la página) ----------
-- Si ya habías corrido una versión anterior de este script con categorías distintas
-- (Filtrado / Espresso / Frío / Comidas / Experiencias), corre primero esto para
-- reacomodar tus productos existentes a las nuevas categorías por momento del día:
-- update public.menu_items set category = 'Buenos días' where category in ('Filtrado','Espresso');
-- update public.menu_items set category = 'Para la tarde' where category = 'Frío';
-- update public.menu_items set category = 'Salados' where category = 'Comidas';

insert into public.menu_items (name, category, icon, price, description, featured) values
  ('V60 grano dominicano','Buenos días','v60',250,'Extracción por goteo, single origin, notas frutales.', true),
  ('Chemex para dos','Buenos días','chemex',420,'Inmersión-goteo, taza limpia, ideal para compartir.', false),
  ('Espresso doble origen','Buenos días','espresso',150,'Cuerpo denso, notas a chocolate y frutos secos.', false),
  ('Tostada de aguacate','Salados','toast',320,'Masa madre, aguacate, semillas y limón.', false),
  ('Sandwich de la barra','Salados','sandwich',380,'Jamón serrano, manchego y rúcula.', false),
  ('Flat white de autor','Para la tarde','flatwhite',210,'Doble shot, leche microespumada, textura sedosa.', true),
  ('Cold brew 24h','Para la tarde','coldbrew',220,'Reposado 24 horas, baja acidez, cuerpo suave.', false),
  ('Cata guiada','Experiencias','cupping',650,'Tres orígenes dominicanos, guiada por la barra.', false)
on conflict do nothing;

-- =========================================================
-- Listo. Crea tu primera cuenta de dueño/comensal desde la
-- propia página: "Iniciar sesión" → "Comensal · Dueño" → "Crear una".
-- =========================================================
