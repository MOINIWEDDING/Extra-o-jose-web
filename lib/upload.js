import { sb, BARRO_CONFIGURED } from './supabaseClient';

// Revisa si un archivo de imagen tiene canal alfa con transparencia real
// (no solo que sea .png — comprueba que al menos un píxel muestreado sea transparente).
export function hasTransparency(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let transparent = false;
        for (let i = 3; i < data.length; i += 4 * 37) {
          // muestreo cada ~37 píxeles: más rápido en imágenes grandes
          if (data[i] < 250) { transparent = true; break; }
        }
        URL.revokeObjectURL(url);
        resolve(transparent);
      } catch (e) {
        URL.revokeObjectURL(url);
        resolve(true); // canvas bloqueado por CORS: no forzamos el rechazo
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(true); };
    img.src = url;
  });
}

// Sube un archivo al bucket 'fotos' y devuelve su URL pública.
// onProgress recibe un número de 0 a 100 (aproximado).
// opts.requireTransparent=true exige un PNG con fondo transparente real (fotos de producto).
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
    const ok = await hasTransparency(file);
    if (!ok) {
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
