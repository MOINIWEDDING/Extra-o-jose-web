'use client';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useMenuItems, money } from '@/hooks/useMenuItems';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';
import EditablePhoto from '@/components/EditablePhoto';
import ProductCard from '@/components/ProductCard';
import OffersCarousel from '@/components/OffersCarousel';
import GiftCardModal from '@/components/GiftCardModal';
import GiftCardDesignManager from '@/components/GiftCardDesignManager';
import Reveal from '@/components/Reveal';
import AuthGate from '@/components/AuthGate';

function initials(name) {
  const clean = (name || '').trim();
  if (!clean) return null;
  const letters = clean.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return letters || null;
}

function Avatar({ name }) {
  const letters = initials(name);
  return (
    <div className="profile-av">
      {letters || (
        <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, stroke: '#fff', fill: 'none', strokeWidth: 1.8 }}>
          <circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
      )}
    </div>
  );
}

export default function CuentaPage() {
  const { profile, isStaff, logout } = useAuth();

  if (!profile) return <AuthGate />;
  if (isStaff) return <StaffView profile={profile} logout={logout} />;
  return <ClientView profile={profile} logout={logout} />;
}

function ClientView({ profile, logout }) {
  const { items } = useMenuItems();
  const { ids, isGuest } = useFavorites();
  const favItems = useMemo(() => items.filter((i) => ids.has(i.id)), [items, ids]);
  const [giftModal, setGiftModal] = useState(null); // 'buy' | 'redeem' | null
  const [giftCards, setGiftCards] = useState([]);
  const [viewingCard, setViewingCard] = useState(null);

  const loadGiftCards = useCallback(async () => {
    if (!BARRO_CONFIGURED) return;
    const { data, error } = await sb
      .from('gift_cards')
      .select('*, gift_card_designs(name, image_url)')
      .or(`buyer_user_id.eq.${profile.id},redeemed_by.eq.${profile.id}`)
      .order('created_at', { ascending: false });
    if (!error && data) setGiftCards(data);
  }, [profile.id]);

  useEffect(() => { loadGiftCards(); }, [loadGiftCards]);

  return (
    <section className="cuenta-page">
      <div className="wrap">
        <Reveal className="profile-card">
          <Avatar name={profile.name} />
          <div>
            <h2 style={{ fontSize: 22 }}>{profile.name}</h2>
            <span className="role-tag">Cliente</span>
          </div>
        </Reveal>

        <Reveal className="giftcard-card" delay={0.08}>
          <span className="eyebrow" style={{ color: 'rgba(243,236,221,0.75)' }}>Balance de gift card</span>
          <h3>{money(profile.gift_card_balance || 0)}</h3>
          <div className="giftcard-actions">
            <button type="button" className="btn btn-amber btn-sm" onClick={() => setGiftModal('buy')}>Comprar</button>
            <button type="button" className="btn btn-ghost-light btn-sm" onClick={() => setGiftModal('redeem')}>Canjear</button>
          </div>
        </Reveal>

        {giftCards.length > 0 && (
          <>
            <div className="home-section-top" style={{ marginTop: 30 }}><h3>Tus gift cards</h3></div>
            <div className="offers-wrap" style={{ margin: '0 -20px' }}>
              <div className="offers-track">
                {giftCards.map((gc) => (
                  <button
                    type="button"
                    key={gc.id}
                    className="offer-card giftcard-banner"
                    onClick={() => setViewingCard(gc)}
                  >
                    <div className="ph">
                      {gc.gift_card_designs?.image_url
                        ? <img className="real" src={gc.gift_card_designs.image_url} alt="" />
                        : <svg className="ph-icon" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18" /></svg>}
                    </div>
                    <div className="offer-content">
                      <p className="eyebrow">{gc.status === 'activa' ? 'Activa' : 'Canjeada'}</p>
                      <h3>{money(gc.amount)}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="home-section-top" style={{ marginTop: 34 }}>
          <h3>Tus favoritos</h3>
        </div>
        {isGuest && <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>Sesión de invitado: tus favoritos no se guardan al cerrar el navegador.</p>}
        {favItems.length === 0 ? (
          <p className="empty-note">Todavía no tienes favoritos. Toca el corazón en cualquier producto del menú.</p>
        ) : (
          <div className="home-grid">
            {favItems.map((item) => <ProductCard key={item.id} item={item} tint="manana" />)}
          </div>
        )}

        <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: 40 }} onClick={logout}>Cerrar sesión</button>
      </div>

      <AnimatePresence>
        {giftModal && (
          <GiftCardModal mode={giftModal} onClose={() => setGiftModal(null)} onDone={loadGiftCards} />
        )}
        {viewingCard && (
          <GiftCardDetailModal card={viewingCard} onClose={() => setViewingCard(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function GiftCardDetailModal({ card, onClose }) {
  return (
    <motion.div className="overlay show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div className="modal" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
          <svg className="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        {card.gift_card_designs?.image_url && (
          <div className="ph" style={{ height: 160, borderRadius: '14px 14px 0 0', border: 'none' }}>
            <img className="real" src={card.gift_card_designs.image_url} alt="" />
          </div>
        )}
        <div className="modal-body">
          <p className="eyebrow on-cream">{card.gift_card_designs?.name || 'Gift card'}</p>
          <h3 style={{ marginTop: 4 }}>{money(card.amount)}</h3>
          <div className="giftcard-code" style={{ marginTop: 16 }}>{card.code}</div>
          <div className="info-list" style={{ marginTop: 20 }}>
            <div className="info-row">
              <div><b>Estado</b><span>{card.status === 'activa' ? 'Activa' : 'Canjeada'}</span></div>
            </div>
            <div className="info-row">
              <div><b>Fecha de compra</b><span>{new Date(card.created_at).toLocaleDateString('es-DO')}</span></div>
            </div>
            {card.status === 'canjeada' && card.redeemed_by_name && (
              <div className="info-row">
                <div><b>Canjeada por</b><span>{card.redeemed_by_name}</span></div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StaffView({ profile, logout }) {
  return (
    <section className="cuenta-page">
      <div className="wrap">
        <Reveal className="profile-card">
          <Avatar name={profile.name} />
          <div>
            <h2 style={{ fontSize: 22 }}>{profile.name}</h2>
            <span className="role-tag">Comensal · Dueño</span>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="section-head" style={{ marginTop: 34 }}>
            <p className="eyebrow">Panel del dueño</p>
            <h2 style={{ fontSize: 22 }}>Personalización de la página</h2>
            <p>Los productos y categorías se editan directamente en Inicio y Menú (aparecen los controles al pasar el cursor). Aquí puedes manejar las fotos del sitio y los banners de oferta.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="home-section-top"><h3>Fotos del sitio</h3></div>
          <div className="admin-photo-grid">
            <div><EditablePhoto imgKey="welcome" label="Bienvenida" className="admin-thumb" /><span>Bienvenida</span></div>
            <div><EditablePhoto imgKey="hero" label="Portada" className="admin-thumb" /><span>Portada / oferta</span></div>
            <div><EditablePhoto imgKey="founder" label="Fundador" className="admin-thumb" /><span>Fundador</span></div>
            <div><EditablePhoto imgKey="azotea" label="Azotea" className="admin-thumb" /><span>Azotea</span></div>
            <div><EditablePhoto imgKey="gallery-0" label="La barra" className="admin-thumb" /><span>La barra</span></div>
            <div><EditablePhoto imgKey="gallery-1" label="El salón" className="admin-thumb" /><span>El salón</span></div>
            <div><EditablePhoto imgKey="gallery-2" label="Detalle" className="admin-thumb" /><span>Detalle</span></div>
            <div><EditablePhoto imgKey="map" label="Mapa" className="admin-thumb" /><span>Mapa / fachada</span></div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="home-section-top" style={{ marginTop: 34 }}><h3>Banners de oferta</h3></div>
          <OffersCarousel />
        </Reveal>

        <Reveal delay={0.2}>
          <div className="home-section-top" style={{ marginTop: 34 }}><h3>Diseños de gift card</h3></div>
          <GiftCardDesignManager />
        </Reveal>

        <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: 20 }} onClick={logout}>Cerrar sesión</button>
      </div>
    </section>
  );
}
