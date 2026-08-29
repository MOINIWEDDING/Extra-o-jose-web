'use client';
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useMenuItems, money } from '@/hooks/useMenuItems';
import EditablePhoto from '@/components/EditablePhoto';
import ProductCard from '@/components/ProductCard';
import OffersCarousel from '@/components/OffersCarousel';
import Reveal from '@/components/Reveal';
import AuthGate from '@/components/AuthGate';

function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
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

  return (
    <section className="cuenta-page">
      <div className="wrap">
        <Reveal className="profile-card">
          <div className="profile-av">{initials(profile.name)}</div>
          <div>
            <h2 style={{ fontSize: 22 }}>{profile.name}</h2>
            <span className="role-tag">Cliente</span>
          </div>
        </Reveal>

        <Reveal className="giftcard-card" delay={0.08}>
          <span className="eyebrow" style={{ color: 'rgba(243,236,221,0.75)' }}>Balance de gift card</span>
          <h3>{money(profile.gift_card_balance || 0)}</h3>
          <p>Pregunta en la barra cómo recargarla.</p>
        </Reveal>

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
    </section>
  );
}

function StaffView({ profile, logout }) {
  return (
    <section className="cuenta-page">
      <div className="wrap">
        <Reveal className="profile-card">
          <div className="profile-av">{initials(profile.name)}</div>
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

        <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: 20 }} onClick={logout}>Cerrar sesión</button>
      </div>
    </section>
  );
}
