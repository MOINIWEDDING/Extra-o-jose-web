# El Extraño José — versión Next.js

Migración completa del sitio (antes HTML/CSS/JS vanilla) a **Next.js 14 (App Router)** + React,
manteniendo el mismo diseño, Supabase, roles y funciones.

## Requisitos
- Node.js 18.18+ (usa `node -v` para revisar)
- Una cuenta de Supabase (gratis)

## 1. Instalar dependencias
```bash
npm install
```

## 2. Conectar Supabase
1. Crea un proyecto en https://supabase.com
2. Ve a **SQL Editor → New query**, pega todo el contenido de `supabase-setup.sql` y ejecútalo.
   (Si ya tenías el proyecto de la versión anterior, no pasa nada — el script usa `if not exists` / `on conflict do nothing` en todo, puedes correrlo de nuevo sin miedo.)
3. Copia `.env.local.example` a `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Abre `.env.local` y pon tu **Project URL** y **anon public key** (Supabase → Project Settings → API).

## 3. Correr en desarrollo
```bash
npm run dev
```
Abre http://localhost:3000

## 4. Publicar
```bash
npm run build
npm start
```
O despliega directo en **Vercel** (los creadores de Next.js): conecta el repo, define las mismas variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en el panel de Vercel, y listo — cada push se publica solo.

## Qué cambió respecto a la versión HTML/CSS/JS
- **Rutas reales de Next.js** en vez de archivos `.html` sueltos: `/`, `/menu`, `/nosotros`, `/visitanos`.
- **Componentes de React** (`components/`) en vez de manipular el DOM a mano.
- **Contextos de React** (`context/AuthContext.jsx`, `context/ToastContext.jsx`) en vez de variables globales (`window.Barro`).
- **Hooks** (`hooks/useMenuItems.js`, `hooks/useUploader.js`) para los datos y la subida de fotos.
- **Fuentes optimizadas** con `next/font/google` (Outfit, Urbanist) — se auto-hospedan, no dependen de una petición externa a Google Fonts.
- El diseño (`app/globals.css`), la base de datos y las reglas de Supabase **son las mismas** que en la versión anterior.

## Qué sigue igual
- Los roles **Cliente** / **Comensal · Dueño**.
- El menú con carruseles por recomendación (Buenos días, Salados, Para la tarde, Experiencias).
- Los banners de oferta editables desde el modo Comensal/Dueño.
- La subida de fotos de producto: solo PNG con el fondo realmente transparente.
- Las fotos del sitio (portada, fundador, azotea, galería, mapa) editables por el dueño.

## Estructura
```
app/
  layout.js            → shell global (fuentes, header, tabbar, providers)
  page.js               → Inicio
  menu/page.js           → Menú
  nosotros/page.js        → Nosotros
  visitanos/page.js        → Visítanos
  globals.css              → todo el diseño (portado 1:1 de la versión anterior)
components/                 → Header, Tabbar, modales, carruseles, etc.
context/                     → AuthContext (sesión/rol), ToastContext (avisos)
hooks/                        → useMenuItems, useUploader
lib/                           → supabaseClient.js, upload.js
supabase-setup.sql               → mismo esquema de base de datos de siempre
```
