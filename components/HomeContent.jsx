'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMenuItems, money } from '@/hooks/useMenuItems';
import OffersCarousel from './OffersCarousel';

const CATS = [
  { slug: 'buenos-dias', label: 'Buenos días', tint: 'manana', icon: <><path d="M14 10h20l-8 16v10a2 2 0 0 1-4 0V26z" /><path d="M10 10h28" /></> },
  { slug: 'salados', label: 'Salados', tint: 'salado', icon: <><rect x="9" y="14" width="30" height="20" rx="3" /><path d="M14 22c4-3 6 2 9-1s6 2 9-1s4 1 4 1" opacity=".8" /></> },
  { slug: 'para-la-tarde', label: 'Para la tarde', tint: 'tarde', icon: <><path d="M10 18h22v10a11 11 0 0 1-22 0z" /><path d="M32 20h4a4 4 0 0 1 0 8h-4" /></> },
  { slug: 'experiencias', label: 'Experiencias', tint: 'experiencia', icon: <><ellipse cx="16" cy="30" rx="8" ry="6" /><ellipse cx="34" cy="26" rx="7" ry="5.5" /></> },
];

export default function HomeContent() {
  const { items } = useMenuItems();
  const [query, setQuery] = useState('');
  const [favs, setFavs] = useState(() => new Set());

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) return items.filter((i) => i.name.toLowerCase().includes(q));
    const featured = items.filter((i) => i.featured);
    return (featured.length ? featured : items).slice(0, 4);
  }, [items, query]);

  const title = query.trim() ? 'Resultados' : 'Populares';

  function toggleFav(id) {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <section className="home-top">
      <div className="wrap">
        <div className="home-greet reveal">Bienvenido a<strong>El Extraño José</strong></div>

        <div className="home-search">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.3-4.3" /></svg>
          <input
            type="text"
            placeholder="Busca un café, un plato…"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <OffersCarousel />

        <div className="cat-row reveal">
          {CATS.map((c) => (
            <Link key={c.slug} className="cat-item" href={`/menu#${c.slug}`}>
              <div className="cat-icon" style={{ background: `var(--tint-${c.tint})` }}>
                <svg viewBox="0 0 48 48" fill="none" stroke="var(--ink)" strokeWidth="1.6">{c.icon}</svg>
              </div>
              <span>{c.label}</span>
            </Link>
          ))}
        </div>

        <div className="home-section-top">
          <h3>{title}</h3>
          <Link href="/menu">Ver todo</Link>
        </div>
        <div className="home-grid">
          {list.length === 0 ? (
            <p className="empty-note" style={{ gridColumn: '1/-1' }}>No encontramos nada con ese nombre.</p>
          ) : list.map((item) => (
            <div className="home-card reveal in" key={item.id}>
              <button type="button" className={`fav-btn${favs.has(item.id) ? ' on' : ''}`} aria-label="Favorito" onClick={() => toggleFav(item.id)}>
                <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9.3-8.8C1.2 8 2.7 4.8 6 4.2c2-.4 3.7.5 6 2.6 2.3-2.1 4-3 6-2.6 3.3.6 4.8 3.8 3.3 7C19 15.6 12 20 12 20z" /></svg>
              </button>
              <Link href="/menu">
                <div className="home-card-photo">
                  {item.image_url && <img src={item.image_url} alt={item.name} />}
                </div>
                <div className="home-card-body">
                  <span className="home-card-tag">{item.category}</span>
                  <h4>{item.name}</h4>
                  <div className="home-card-bottom"><span className="home-card-price">{money(item.price)}</span></div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
