'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useCategories } from '@/hooks/useCategories';
import { slugify } from '@/lib/slugify';
import OffersCarousel from './OffersCarousel';
import CategoryCarousels from './CategoryCarousels';
import ProductCard from './ProductCard';
import ProductIcon from './ProductIcon';
import Reveal from './Reveal';
import WelcomeScreen from './WelcomeScreen';

export default function HomeContent() {
  const { items } = useMenuItems();
  const { categories } = useCategories();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, query]);

  const searching = query.trim().length > 0;

  return (
    <>
      <WelcomeScreen />
      <section className="home-top">
        <div className="wrap">
          <div className="home-greet">Bienvenido a<strong>El Extraño José</strong></div>

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

          {!searching && (
            <>
              <OffersCarousel />

              <motion.div className="cat-row" layout>
                {categories.map((c) => (
                  <Link key={c.id} className="cat-item" href={`/menu#${slugify(c.name)}`}>
                    <div className="cat-icon" style={{ background: `var(--tint-${c.tint})` }}>
                      <ProductIcon name={c.icon} />
                    </div>
                    <span>{c.name}</span>
                  </Link>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </section>

      {searching ? (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="home-section-top"><h3>Resultados</h3></div>
            {results.length === 0 ? (
              <p className="empty-note">No encontramos nada con ese nombre.</p>
            ) : (
              <div className="home-grid">
                {results.map((item) => <ProductCard key={item.id} item={item} tint="manana" />)}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <CategoryCarousels limit={6} showAddCategory={false} />
          </div>
        </section>
      )}
    </>
  );
}
