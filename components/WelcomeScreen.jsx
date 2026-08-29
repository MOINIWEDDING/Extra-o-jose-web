'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1758900450186-e829f72d25fb?q=80&w=1200&auto=format&fit=crop';
const SEEN_KEY = 'ej-welcome-seen';

export default function WelcomeScreen() {
  const { openAuth } = useAuth();
  const [show, setShow] = useState(false);
  const [photo, setPhoto] = useState(DEFAULT_PHOTO);

  useEffect(() => {
    let seen = false;
    try { seen = window.sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) { /* ignore */ }
    if (!seen) setShow(true);

    async function loadPhoto() {
      if (!BARRO_CONFIGURED) return;
      const { data, error } = await sb.from('site_images').select('url').eq('key', 'welcome').single();
      if (!error && data && data.url) setPhoto(data.url);
    }
    loadPhoto();
  }, []);

  function dismiss() {
    try { window.sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* ignore */ }
    setShow(false);
  }

  function go(mode) {
    dismiss();
    if (mode === 'guest') return;
    openAuth(mode === 'signup' ? 'signup' : 'login', 'cliente');
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="welcome-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="welcome-photo" style={{ backgroundImage: `url(${photo})` }} />
          <motion.div
            className="welcome-sheet"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <p className="eyebrow">El Extraño José</p>
            <h2>Bienvenido a tu rincón diferente.</h2>
            <p className="welcome-sub">Café de especialidad en Santiago. Entra para guardar tus favoritos y tu carrito, o sigue como invitado.</p>
            <div className="welcome-actions">
              <motion.button whileTap={{ scale: 0.97 }} type="button" className="btn btn-amber btn-block" onClick={() => go('signup')}>Regístrate</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} type="button" className="btn btn-ghost-light btn-block" onClick={() => go('login')}>Inicia sesión</motion.button>
              <button type="button" className="welcome-guest" onClick={() => go('guest')}>Continuar como invitado</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
