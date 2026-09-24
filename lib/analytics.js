import { sb, BARRO_CONFIGURED } from './supabaseClient';

const SESSION_KEY = 'ej-analytics-session';
const VISIT_LOGGED_KEY = 'ej-analytics-visit-logged';

function getSessionId() {
  if (typeof window === 'undefined') return null;
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch (e) {
    return null;
  }
}

// una sola visita registrada por sesión de navegador, sin importar cuántas
// páginas vea o cuántas veces cambie de sucursal en esa misma visita.
export async function trackVisit(branch) {
  if (!BARRO_CONFIGURED) return;
  const sessionId = getSessionId();
  if (!sessionId) return;
  try {
    if (window.sessionStorage.getItem(VISIT_LOGGED_KEY) === '1') return;
    window.sessionStorage.setItem(VISIT_LOGGED_KEY, '1');
  } catch (e) { /* ignore */ }
  await sb.from('analytics_visits').insert({ session_id: sessionId, branch: branch || null });
}

export async function trackProductView(itemId, branch) {
  if (!BARRO_CONFIGURED || !itemId) return;
  const sessionId = getSessionId();
  if (!sessionId) return;
  await sb.from('analytics_product_views').insert({ item_id: itemId, branch: branch || null, session_id: sessionId });
}
