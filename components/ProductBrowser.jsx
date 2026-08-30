'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useCategories } from '@/hooks/useCategories';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';
import Reveal from './Reveal';

export default function ProductBrowser() {
  const { isStaff } = useAuth();
  const { categories } = useCategories();
  const { items, loading, reload } = useMenuItems();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('Todos');
  const [editingItem, setEditingItem] = useState(null); // item | 'new' | null

  useEffect(() => {
    const fromUrl = searchParams.get('cat');
    if (fromUrl) setActiveCat(fromUrl);
  }, [searchParams]);

  const tintOf = (categoryName) => {
    const c = categories.find((c) => c.name === categoryName);
    return c ? c.tint : 'manana';
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const matchesCat = activeCat === 'Todos' || i.category === activeCat;
      const matchesQuery = !q || i.name.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [items, activeCat, query]);

  async function handleDelete(item) {
    if (BARRO_CONFIGURED) {
      const { error } = await sb.from('menu_items').delete().eq('id', item.id);
      if (error) { alert('No se pudo eliminar: ' + error.message); return; }
    }
    await reload();
  }

  return (
    <>
      <Reveal className="home-search" style={{ marginTop: 0 }}>
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.3-4.3" /></svg>
        <input
          type="text"
          placeholder="Busca un café, un plato…"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Reveal>

      <Reveal className="tabs" delay={0.05} style={{ marginTop: 16 }}>
        <button type="button" className={`tab${activeCat === 'Todos' ? ' active' : ''}`} onClick={() => setActiveCat('Todos')}>Todos</button>
        {categories.map((c) => (
          <button key={c.id} type="button" className={`tab${activeCat === c.name ? ' active' : ''}`} onClick={() => setActiveCat(c.name)}>{c.name}</button>
        ))}
      </Reveal>

      <div className="home-grid" style={{ marginTop: 28 }}>
        {loading ? null : filtered.length === 0 ? (
          <p className="empty-note" style={{ gridColumn: '1/-1' }}>No encontramos nada con ese nombre o categoría.</p>
        ) : filtered.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            tint={tintOf(item.category)}
            onEdit={isStaff ? (it) => setEditingItem(it) : undefined}
            onDelete={isStaff ? handleDelete : undefined}
          />
        ))}
        {isStaff && (
          <button type="button" className="add-card" style={{ minHeight: 320 }} onClick={() => setEditingItem('new')}>
            <div className="plus"><svg className="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></div>
            <span>Agregar producto</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {editingItem && (
          <ProductModal
            item={editingItem === 'new' ? null : editingItem}
            defaultCategory={activeCat !== 'Todos' ? activeCat : undefined}
            categories={categories}
            onClose={() => setEditingItem(null)}
            onSaved={reload}
          />
        )}
      </AnimatePresence>
    </>
  );
}
