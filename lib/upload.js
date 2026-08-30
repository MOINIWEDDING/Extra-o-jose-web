import { sb, BARRO_CONFIGURED } from './supabaseClient';

// Tamaño exigido para fotos de producto: cuadradas (para que floten parejo
// sobre la tarjeta) y con suficiente resolución para verse nítidas.
export const PRODUCT_PHOTO_MIN = 500;      // píxeles mínimos por lado
export const PRODUCT_PHOTO_MAX = 3000;     // píxeles máximos por lado (evita archivos gigantes)
const SQUARE_TOLERANCE = 0.08;             // hasta 8% de diferencia entre ancho y alto

// Carga la imagen una sola vez y devuelve sus medidas + si tiene transparencia real
// (no solo que sea .png — comprueba que al menos un píxel muestreado sea transparente).
function analyzeImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      let transparent = true; // si el canvas se bloquea por CORS, no forzamos el rechazo
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, width, height).data;
        transparent = false;
        for (let i = 3; i < data.length; i += 4 * 37) {
          // muestreo cada ~37 píxeles: más rápido en imágenes grandes
          if (data[i] < 250) { transparent = true; break; }
        }
      } catch (e) { /* canvas bloqueado, se ignora */ }
      URL.revokeObjectURL(url);
      resolve({ width, height, transparent });
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ width: 0, height: 0, transparent: true }); };
    img.src = url;
  });
}

// Sube un archivo al bucket 'fotos' y devuelve su URL pública.
// onProgress recibe un número de 0 a 100 (aproximado).
// opts.requireTransparent=true exige un PNG cuadrado, con el fondo ya quitado
// (fotos de producto) — así todas se ven parejas al flotar sobre la tarjeta.
export async function uploadPhoto(file, onProgress, opts = {}) {
  if (!BARRO_CONFIGURED) throw new Error('Conecta Supabase para poder subir fotos.');
  if (!file) throw new Error('No se seleccionó ninguna foto.');
  if (!file.type.startsWith('image/')) throw new Error('El archivo debe ser una imagen.');
  if (file.size > 5 * 1024 * 1024) throw new Error('La foto pesa más de 5 MB. Usa una más liviana.');

  if (opts.requireTransparent) {
    if (file.type !== 'image/png') {
      throw new Error('La foto del producto debe ser un PNG con el fondo ya quitado (sin fondo).');
    }
    if (onProgress) onProgress(8);
    const { width, height, transparent } = await analyzeImage(file);

    if (width < PRODUCT_PHOTO_MIN || height < PRODUCT_PHOTO_MIN) {
      throw new Error(`La foto es muy pequeña (${width}×${height}px). Debe medir al menos ${PRODUCT_PHOTO_MIN}×${PRODUCT_PHOTO_MIN}px.`);
    }
    if (width > PRODUCT_PHOTO_MAX || height > PRODUCT_PHOTO_MAX) {
      throw new Error(`La foto es muy grande (${width}×${height}px). Usa una de máximo ${PRODUCT_PHOTO_MAX}×${PRODUCT_PHOTO_MAX}px.`);
    }
    const ratio = width / height;
    if (ratio < 1 - SQUARE_TOLERANCE || ratio > 1 + SQUARE_TOLERANCE) {
      throw new Error(`La foto debe ser cuadrada (ancho y alto casi iguales). Esta mide ${width}×${height}px — recórtala antes de subirla.`);
    }
    if (!transparent) {
      throw new Error('Esta imagen no tiene el fondo transparente. Quítale el fondo (por ejemplo en remove.bg) y vuelve a subirla.');
    }
  }

  if (onProgress) onProgress(15);
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await sb.storage.from('fotos').upload(path, file, {
    cacheControl: '3600', upsert: false, contentType: file.type,
  });
  if (error) throw new Error('No se pudo subir la foto: ' + error.message);

  if (onProgress) onProgress(85);
  const { data } = sb.storage.from('fotos').getPublicUrl(path);
  if (onProgress) onProgress(100);
  return data.publicUrl;
}
