# El Extraño José — sitio con Supabase

## 1. Crear el proyecto de Supabase
1. Entra a https://supabase.com y crea un proyecto gratis.
2. Ve a **SQL Editor → New query**, pega todo el contenido de `supabase-setup.sql` y ejecútalo.
   Esto crea las tablas `profiles`, `menu_items`, `site_images`, sus políticas de seguridad (RLS) y el menú de ejemplo.
3. Ve a **Project Settings → API** y copia:
   - **Project URL**
   - **anon public key**

## 2. Conectar el sitio
Abre `js/supabase-client.js` y reemplaza:
```js
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU-ANON-KEY-AQUI';
```
con tus valores reales.

## 3. Confirmación de correo (importante)
Por defecto, Supabase pide confirmar el correo antes de poder iniciar sesión.
Para desactivarlo mientras pruebas: **Authentication → Providers → Email → "Confirm email"** → apágalo.
Para producción, déjalo activado y en **Authentication → URL Configuration** define la URL real donde publiques el sitio (paso 4), o los correos de confirmación no van a redirigir bien.

## 4. Publicar el sitio
Los links de confirmación de correo y el login necesitan una URL pública real — no funcionan abriendo el archivo `index.html` directamente desde tu computadora (`file://`). Opciones gratuitas y rápidas:
- **Netlify** (arrastra la carpeta a app.netlify.com/drop)
- **Vercel**
- **GitHub Pages**

## 5. Crear tu primera cuenta de dueño/comensal
Una vez publicado: abre el sitio → "Iniciar sesión" → pestaña **"Comensal · Dueño"** → "Crear una". Esa cuenta ya podrá:
- Agregar, editar y eliminar productos del menú (`menu.html`)
- Reemplazar las fotos placeholder del sitio (portada, galería, mapa)

Cualquier persona que se registre en la pestaña **"Cliente"** solo podrá ver el sitio, sin edición.

## Estructura del proyecto
```
index.html              → página principal (inicio, historia, concepto, azotea, cultura cafetera, teaser de menú, ubicación)
menu.html                → página del menú completo con el panel de edición
css/style.css             → estilos compartidos (tema oscuro industrial + acento ámbar, tipografía viva)
js/supabase-client.js     → credenciales de tu proyecto Supabase (edítalo)
js/site.js                 → sesión, login/registro, banner de modo staff, edición de fotos
js/menu.js                 → listado y CRUD del menú
supabase-setup.sql         → script para crear las tablas y políticas en Supabase
```

## Notas sobre imágenes
- El sitio viene precargado con fotos de stock de Unsplash (licencia libre) para que se vea completo desde el primer momento — en la portada, la galería y cada producto del menú.
- Todas se guardan como una **URL**, no como un archivo subido. Reemplázalas por fotos reales del local cuando las tengas: en modo Comensal/Dueño, pasa el cursor sobre cualquier foto y toca "Cambiar".
- Si más adelante quieres subir archivos directamente en lugar de pegar URLs, se puede agregar Supabase Storage — dilo y lo conectamos.

## Animaciones
El sitio usa scroll-reveal (las secciones aparecen suavemente al hacer scroll), una foto flotante en la portada, y hover con elevación en las tarjetas. Todo respeta "reducir movimiento" del sistema operativo del visitante.

## El menú (rediseño más reciente)
El menú (`menu.html`) ahora se organiza en carruseles horizontales por recomendación — **Buenos días, Salados, Para la tarde, Experiencias** — en vez de una grilla con pestañas de categoría. Cada producto usa un ícono de línea propio (no foto), con flechas de navegación que aparecen solo cuando hay más para ver. El botón "Agregar" todavía no está conectado a un carrito real — muestra un aviso de "pídelo en la barra"; si más adelante quieres pedidos en línea de verdad, dilo y lo construimos.

Nota técnica: se pidió integrar un componente React + shadcn/ui + Tailwind + TypeScript. Este proyecto es HTML/CSS/JS vanilla conectado directo a Supabase — migrar a React/Next/shadcn ahora significaría reconstruir el login y el CRUD desde cero. En su lugar, repliqué el mismo patrón visual e interacción (carrusel, flechas, tarjetas) de forma nativa, sin dependencias nuevas. Si en algún momento quieres el proyecto completo en React, es un cambio de stack grande — mejor decidirlo aparte, no como parte de un ajuste de diseño.
