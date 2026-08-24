-- =========================================================
-- Barro Café — configuración de Supabase
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
-- (toma el nombre y el rol elegidos en el formulario de registro)
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
  category text not null default 'Bebidas',
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

-- ---------- fotos placeholder del sitio (hero, galería, mapa) ----------
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

-- filas base para que la página pueda hacer UPDATE directo (no INSERT) desde el cliente
insert into public.site_images (key, url) values
  ('hero',''), ('gallery-0',''), ('gallery-1',''), ('gallery-2',''), ('map','')
on conflict (key) do nothing;

-- ---------- menú de ejemplo (bórralo o edítalo desde la página) ----------
insert into public.menu_items (name, category, price, description) values
  ('Café de olla','Bebidas',180,'Grano tostado a fuego lento, canela y panela.'),
  ('Latte de barro','Bebidas',220,'Espresso doble, leche vaporizada y un toque de vainilla.'),
  ('Cold brew de la casa','Bebidas',210,'Reposado 18 horas en frío, suave y con baja acidez.'),
  ('Tostada de aguacate','Comidas',320,'Pan de masa madre, aguacate, semillas y limón.'),
  ('Sandwich de la barra','Comidas',380,'Jamón serrano, queso manchego y rúcula en pan artesanal.'),
  ('Bowl de avena','Comidas',260,'Avena, frutas de temporada, miel y granola casera.'),
  ('Flan de café','Postres',190,'Receta de la casa con reducción de espresso.'),
  ('Brownie tibio','Postres',210,'Chocolate 70%, nueces y un toque de sal de mar.')
on conflict do nothing;

-- =========================================================
-- Listo. Ahora crea tu primera cuenta de dueño/comensal
-- desde la propia página web (botón "Iniciar sesión" →
-- pestaña "Comensal · Dueño" → "Crear una").
-- =========================================================
