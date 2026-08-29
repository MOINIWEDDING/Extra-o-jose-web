'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1758900450186-e829f72d25fb?q=80&w=1200&auto=format&fit=crop';

export default function AuthGate() {
  const { openAuth } = useAuth();
  const router = useRouter();
  const [photo, setPhoto] = useState(DEFAULT_PHOTO);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!BARRO_CONFIGURED) return;
      const { data, error } = await sb.from('site_images').select('url').eq('key', 'welcome').single();
      if (active && !error && data && data.url) setPhoto(data.url);
    }
    load();
    return () => { active = false; };
  }, []);

  return (
    <motion.section
      className="authgate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="authgate-bg" style={{ backgroundImage: `url(${photo})` }} />
      <div className="authgate-overlay" />

      <motion.div
        className="authgate-card"
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <div className="authgate-icon">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>
        </div>
        <h2>Bienvenido a El Extraño José</h2>
        <p>Guarda tus favoritos, tu carrito y tu balance de gift card.</p>

        <div className="authgate-actions">
          <button type="button" className="btn btn-amber btn-block" onClick={() => openAuth('signup', 'cliente')}>Regístrate</button>
          <button type="button" className="btn btn-ghost btn-block" onClick={() => openAuth('login', 'cliente')}>Inicia sesión</button>
          <button type="button" className="authgate-link" onClick={() => router.push('/')}>Continuar como invitado</button>
        </div>
      </motion.div>
    </motion.section>
  );
}
