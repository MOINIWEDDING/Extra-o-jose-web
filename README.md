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
3. **Importante si ya tenías el proyecto configurado de antes**: corre también `supabase-migration-2.sql`. Esto arregla productos guardados con categorías viejas (por eso no te cargaban categorías ni promociones), y agrega las tablas nuevas: categorías dinámicas, favoritos reales y el balance de gift card.
4. Copia `.env.local.example` a `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
5. Abre `.env.local` y pon tu **Project URL** y **anon public key** (Supabase → Project Settings → API).

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

## Qué cambió en esta última vuelta (rediseño grande)
- **Bug arreglado**: las ofertas y categorías dejaban de mostrarse si la base de datos tenía datos de una versión anterior — ahora solo usan el respaldo de muestra si hay un error real, nunca si la lista está simplemente vacía.
- **Categorías dinámicas**: ya no están fijas en el código. El dueño puede crear, renombrar (ej. "Populares"), cambiarles ícono/color, o borrarlas — se reflejan igual en Inicio y en el Menú.
- **Tarjeta de producto unificada**: mismo diseño (foto + etiquetas + precio + botón "+") en Inicio y en Menú.
- **Carrito**: persiste en el navegador (sin pagos en línea todavía — el botón de confirmar avisa que se pide en la barra).
- **Favoritos reales**: ligados a tu cuenta, visibles en "Cuenta".
- **Pantalla de bienvenida**: aparece una vez por sesión con 3 opciones (Regístrate / Inicia sesión / Continuar como invitado). Su foto se cambia desde "Cuenta" (modo dueño).
- **Cuenta** (`/cuenta`): perfil + balance de gift card + favoritos para clientes; panel de fotos del sitio y banners de oferta para el dueño.
- El encabezado ya no muestra el nombre del local ni un botón de "Iniciar sesión" — ahora es un ícono de cuenta (y de carrito), en el header en escritorio y como pestaña en la barra inferior en móvil.
- Las animaciones de aparición al hacer scroll ahora usan **Framer Motion** de verdad, en las 4 páginas.
