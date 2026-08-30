'use client';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
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
import Avatar from '@/components/Avatar';
import AvatarPicker from '@/components/AvatarPicker';
import AvatarLibraryManager from '@/components/AvatarLibraryManager';
import Reveal from '@/components/Reveal';
import AuthGate from '@/components/AuthGate';

function timeAgo(dateStr) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.round(mins / 60);
  return `hace ${hrs} h`;
}

const ORDER_STATUS_LABELS = {
  nueva: 'Nueva',
  en_preparacion: 'En preparación',
  lista: 'Lista',
  entregada: 'Entregada',
};



export default function CuentaPage() {
  const { profile, isStaff, logout } = useAuth();

  if (!profile) return <AuthGate />;
  if (isStaff) return <StaffView profile={profile} logout={logout} />;
  return <ClientView profile={profile} logout={logout} />;
}

function ClientView({ profile, logout }) {
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const { items } = useMenuItems();
  const { ids, isGuest } = useFavorites();
  const favItems = useMemo(() => items.filter((i) => ids.has(i.id)), [items, ids]);
  const [giftModal, setGiftModal] = useState(null); // 'buy' | 'redeem' | null
  const [giftCards, setGiftCards] = useState([]);
  const [viewingCard, setViewingCard] = useState(null);
  const [myOrders, setMyOrders] = useState([]);

  const loadMyOrders = useCallback(async () => {
    if (!BARRO_CONFIGURED) return;
    const { data, error } = await sb.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
    if (!error && data) setMyOrders(data);
  }, [profile.id]);

  useEffect(() => {
    loadMyOrders();
    if (!BARRO_CONFIGURED) return undefined;
    const channel = sb
      .channel(`my-orders-${profile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${profile.id}` }, () => loadMyOrders())
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [loadMyOrders, profile.id]);

  const loadGiftCards = useCallback(async () => {
    if (!BARRO_CONFIGURED) return;
    // Se hace en dos pasos (en vez de un "join" embebido) para que nunca se
    // pierda una tarjeta por culpa de permisos sobre un diseño relacionado.
    const { data: cards, error } = await sb
      .from('gift_cards')
      .select('*')
      .or(`buyer_user_id.eq.${profile.id},redeemed_by.eq.${profile.id}`)
      .order('created_at', { ascending: false });
    if (error || !cards) return;

    const designIds = [...new Set(cards.map((c) => c.design_id).filter(Boolean))];
    let designsById = {};
    if (designIds.length) {
      const { data: designs } = await sb.from('gift_card_designs').select('id, name, image_url').in('id', designIds);
      (designs || []).forEach((d) => { designsById[d.id] = d; });
    }
    setGiftCards(cards.map((c) => ({ ...c, design: designsById[c.design_id] || null })));
  }, [profile.id]);

  useEffect(() => { loadGiftCards(); }, [loadGiftCards]);

  return (
    <section className="cuenta-page">
      <div className="wrap">
        <Reveal className="profile-card">
          <Avatar profile={profile} />
          <div>
            <h2 style={{ fontSize: 22 }}>{profile.name}</h2>
            <span className="role-tag">Cliente</span>
            <button type="button" className="avatar-change-link" onClick={() => setPickingAvatar(true)}>Cambiar avatar</button>
          </div>
        </Reveal>

        {pickingAvatar && <AvatarPicker onClose={() => setPickingAvatar(false)} />}

        {myOrders.length > 0 && (
          <>
            <div className="home-section-top" style={{ marginTop: 30 }}><h3>Tus pedidos</h3></div>
            <div className="orders-list">
              {myOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-top">
                    <div>
                      <h4>Mesa {order.table_number}</h4>
                      <span className="order-meta">{timeAgo(order.created_at)}</span>
                    </div>
                    <span className="order-price">{money(order.subtotal)}</span>
                  </div>
                  <ul className="order-items">
                    {(order.items || []).map((it, i) => (
                      <li key={i}>
                        <span>{it.qty}× {it.name}</span>
                        {it.notes && <span className="order-item-note">— {it.notes}</span>}
                      </li>
                    ))}
                  </ul>
                  <div className="order-card-bottom">
                    <span className="order-pay">{order.payment_method === 'tarjeta' ? 'Tarjeta de crédito' : order.payment_method}</span>
                    <span className={`order-status-badge status-${order.status}`}>{ORDER_STATUS_LABELS[order.status] || order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <Reveal className="giftcard-card" delay={0.08}>
          <span className="eyebrow" style={{ color: 'rgba(243,236,221,0.75)' }}>Balance de gift card</span>
          <h3>{money(profile.gift_card_balance || 0)}</h3>
          <div className="giftcard-actions">
            <button type="button" className="btn btn-amber btn-sm" onClick={() => setGiftModal('buy')}>Comprar</button>
            <button type="button" className="btn btn-ghost-light btn-sm" onClick={() => setGiftModal('redeem')}>Canjear</button>
          </div>
        </Reveal>

        {giftCards.length > 0 && (
          <GiftCardBanners cards={giftCards} onSelect={setViewingCard} />
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

function GiftCardBanners({ cards, onSelect }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function scrollBy(dir) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth : el.clientWidth, behavior: 'smooth' });
  }

  return (
    <>
      <div className="home-section-top" style={{ marginTop: 30 }}>
        <h3>Tus gift cards</h3>
        {cards.length > 1 && <span className="muted" style={{ fontSize: 12 }}>Desliza para ver todas ({cards.length})</span>}
      </div>
      <div className="offers-wrap" style={{ margin: '0 -20px', position: 'relative' }}>
        {cards.length > 1 && (
          <>
            <button type="button" className="carousel-arrow left" style={{ display: 'flex' }} onClick={() => scrollBy('left')} aria-label="Anterior">
              <svg className="icon" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" className="carousel-arrow right" style={{ display: 'flex' }} onClick={() => scrollBy('right')} aria-label="Siguiente">
              <svg className="icon" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
        <div className="offers-track" ref={trackRef} onScroll={onScroll}>
          {cards.map((gc) => (
            <button
              type="button"
              key={gc.id}
              className="offer-card giftcard-banner"
              onClick={() => onSelect(gc)}
            >
              <div className="ph">
                {gc.design?.image_url
                  ? <img className="real" src={gc.design.image_url} alt="" />
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
      {cards.length > 1 && (
        <div className="offers-dots">
          {cards.map((_, i) => <span key={i} className={i === index ? 'active' : ''} />)}
        </div>
      )}
    </>
  );
}

function GiftCardDetailModal({ card, onClose }) {
  return (
    <motion.div className="overlay show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div className="modal" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
          <svg className="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        {card.design?.image_url && (
          <div className="ph" style={{ height: 160, borderRadius: '14px 14px 0 0', border: 'none' }}>
            <img className="real" src={card.design.image_url} alt="" />
          </div>
        )}
        <div className="modal-body">
          <p className="eyebrow on-cream">{card.design?.name || 'Gift card'}</p>
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
  const [pickingAvatar, setPickingAvatar] = useState(false);
  return (
    <section className="cuenta-page">
      <div className="wrap">
        <Reveal className="profile-card">
          <Avatar profile={profile} />
          <div>
            <h2 style={{ fontSize: 22 }}>{profile.name}</h2>
            <span className="role-tag">Comensal · Dueño</span>
            <button type="button" className="avatar-change-link" onClick={() => setPickingAvatar(true)}>Cambiar avatar</button>
          </div>
        </Reveal>

        {pickingAvatar && <AvatarPicker onClose={() => setPickingAvatar(false)} />}

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

        <Reveal delay={0.22}>
          <div className="home-section-top" style={{ marginTop: 34 }}>
            <h3>Fotos de avatar</h3>
          </div>
          <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>Los clientes eligen entre estas fotos — ellos no pueden subir las suyas.</p>
          <AvatarLibraryManager />
        </Reveal>

        <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: 20 }} onClick={logout}>Cerrar sesión</button>
      </div>
    </section>
  );
}
