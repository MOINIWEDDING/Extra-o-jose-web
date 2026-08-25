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
  category text not null default 'Espresso',
  price numeric not null default 0,
  description text default '',
  image_url text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
insert into public.menu_items (name, category, price, description, image_url) values
  ('V60 grano dominicano','Filtrado',250,'Extracción por goteo, single origin, perfil de taza definido en cada lote.','https://images.unsplash.com/photo-1753837787691-84a06d715d24?q=80&w=800&auto=format&fit=crop'),
  ('Chemex para dos','Filtrado',420,'Método de inmersión-goteo, taza limpia y brillante, ideal para compartir.','https://images.unsplash.com/photo-1758593386033-cb1f842d550c?q=80&w=800&auto=format&fit=crop'),
  ('Espresso doble origen','Espresso',150,'Shot doble, cuerpo denso, notas a chocolate y frutos secos.','https://images.unsplash.com/photo-1498241804937-a517467c0db6?q=80&w=800&auto=format&fit=crop'),
  ('Flat white de autor','Espresso',210,'Doble shot, leche microespumada, textura sedosa de principio a fin.','https://images.unsplash.com/photo-1758900450186-e829f72d25fb?q=80&w=800&auto=format&fit=crop'),
  ('Cold brew 24h','Frío',220,'Reposado 24 horas en frío, baja acidez, cuerpo suave.','https://images.unsplash.com/photo-1759259639356-6eee63241869?q=80&w=800&auto=format&fit=crop'),
  ('Tostada de aguacate','Comidas',320,'Pan de masa madre, aguacate, semillas y limón.','https://images.unsplash.com/photo-1752095809157-9dd2e2dfae8b?q=80&w=800&auto=format&fit=crop'),
  ('Sandwich de la barra','Comidas',380,'Jamón serrano, queso manchego y rúcula en pan artesanal.','https://images.unsplash.com/photo-1696721497656-682d1376c3c8?q=80&w=800&auto=format&fit=crop'),
  ('Cata guiada','Experiencias',650,'Tres orígenes dominicanos, guiada por nuestro equipo de barra.','https://images.unsplash.com/photo-1758945185175-3d54780cd8d0?q=80&w=800&auto=format&fit=crop')
on conflict do nothing;

-- =========================================================
-- Listo. Crea tu primera cuenta de dueño/comensal desde la
-- propia página: "Iniciar sesión" → "Comensal · Dueño" → "Crear una".
-- =========================================================
