'use client';
import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useBranch } from '@/context/BranchContext';
import { useMenuItems, money } from '@/hooks/useMenuItems';
import { useCategories } from '@/hooks/useCategories';
import { useOutOfStock } from '@/hooks/useOutOfStock';
import ProductModal from './ProductModal';
import CategoryModal from './CategoryModal';
import ProductDetailModal from './ProductDetailModal';
import Reveal from './Reveal';

export default function MenuCarta() {
  const { isStaff } = useAuth();
  const { branch } = useBranch();
  const { categories, reload: reloadCategories } = useCategories();
  const { items, reload: reloadItems } = useMenuItems();
  const { outOfStockIds, toggle: toggleStock } = useOutOfStock(branch);
  const [query, setQuery] = useState('');
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null); // {item, defaultCategory} | null
  const [editingCategory, setEditingCategory] = useState(null); // category | 'new' | null

  async function reload() { await Promise.all([reloadItems(), reloadCategories()]); }

  async function handleDeleteItem(item) {
    if (!window.confirm(`¿Eliminar "${item.name}"?`)) return;
    if (BARRO_CONFIGURED) {
      const { error } = await sb.from('menu_items').delete().eq('id', item.id);
      if (error) { alert('No se pudo eliminar: ' + error.message); return; }
    }
    await reloadItems();
  }

  // los clientes no ven lo marcado sin stock en esta sucursal; el dueño sí
  // lo sigue viendo (atenuado), para poder reactivarlo.
  const visibleItems = isStaff ? items : items.filter((i) => !outOfStockIds.has(i.id));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return visibleItems.filter((i) => i.name.toLowerCase().includes(q));
  }, [visibleItems, query]);

  return (
    <div className="carta">
      <Reveal className="carta-search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.3-4.3" /></svg>
        <input
          type="text"
          placeholder="Busca en la carta…"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Reveal>

      {filtered ? (
        <div className="carta-columns" style={{ marginTop: 24 }}>
          {filtered.length === 0 ? (
            <p className="empty-note">No encontramos nada con ese nombre.</p>
          ) : filtered.map((item) => (
            <CartaRow
              key={item.id}
              item={item}
              isStaff={isStaff}
              isOutOfStock={outOfStockIds.has(item.id)}
              onToggleStock={() => toggleStock(item.id)}
              onOpen={() => setViewingItem(item)}
              onEdit={() => setEditingItem({ item, defaultCategory: item.category })}
              onDelete={() => handleDeleteItem(item)}
            />
          ))}
        </div>
      ) : (
        categories.map((cat) => {
          const catItems = visibleItems.filter((i) => i.category === cat.name);
          if (catItems.length === 0 && !isStaff) return null;
          return (
            <Reveal as="div" key={cat.id} className="carta-section">
              <div className="carta-header">
                <h2>{cat.name}</h2>
                {isStaff && (
                  <button type="button" className="icon-btn" aria-label="Editar categoría" onClick={() => setEditingCategory(cat)}>
                    <svg className="icon" style={{ width: 13, height: 13 }} viewBox="0 0 24 24"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
                  </button>
                )}
              </div>
              <div className="carta-rule" />

              {catItems.length === 0 ? (
                <p className="empty-note" style={{ marginBottom: 18 }}>Todavía no hay productos en esta categoría.</p>
              ) : (
                <div className="carta-columns">
                  {catItems.map((item) => (
                    <CartaRow
                      key={item.id}
                      item={item}
                      isStaff={isStaff}
                      isOutOfStock={outOfStockIds.has(item.id)}
                      onToggleStock={() => toggleStock(item.id)}
                      onOpen={() => setViewingItem(item)}
                      onEdit={() => setEditingItem({ item, defaultCategory: cat.name })}
                      onDelete={() => handleDeleteItem(item)}
                    />
                  ))}
                </div>
              )}

              {isStaff && (
                <button type="button" className="carta-add-link" onClick={() => setEditingItem({ item: null, defaultCategory: cat.name })}>
                  + Agregar producto en &quot;{cat.name}&quot;
                </button>
              )}
            </Reveal>
          );
        })
      )}

      {isStaff && (
        <button type="button" className="pill-btn-dark" style={{ marginTop: 10 }} onClick={() => setEditingCategory('new')}>
          + Agregar categoría
        </button>
      )}

      <p className="carta-footnote">Pregunta por nuestras cervezas y té de especialidad disponibles. Precios no incluyen impuestos.</p>

      <AnimatePresence>
        {viewingItem && (
          <ProductDetailModal
            item={viewingItem}
            tint={categories.find((c) => c.name === viewingItem.category)?.tint || 'manana'}
            onClose={() => setViewingItem(null)}
          />
        )}
        {editingItem && (
          <ProductModal
            item={editingItem.item}
            defaultCategory={editingItem.defaultCategory}
            categories={categories}
            onClose={() => setEditingItem(null)}
            onSaved={reload}
          />
        )}
        {editingCategory && (
          <CategoryModal
            category={editingCategory === 'new' ? null : editingCategory}
            onClose={() => setEditingCategory(null)}
            onSaved={reloadCategories}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CartaRow({ item, isStaff, isOutOfStock, onToggleStock, onOpen, onEdit, onDelete }) {
  return (
    <div className={`carta-item${isOutOfStock ? ' carta-item-out' : ''}`}>
      <button type="button" className="carta-item-main" onClick={onOpen}>
        <div className="carta-item-top">
          <span className="carta-item-name">{item.name}</span>
          <span className="carta-item-dots" />
          <span className="carta-item-price">{money(item.price)}</span>
        </div>
        {isOutOfStock && <span className="carta-item-out-label">Sin stock en esta sucursal</span>}
        {item.description && <p className="carta-item-desc">{item.description}</p>}
      </button>
      {isStaff && (
        <div className="carta-item-admin">
          <button
            type="button"
            className={`icon-btn${isOutOfStock ? ' active-warn' : ''}`}
            aria-label={isOutOfStock ? 'Marcar disponible aquí' : 'Marcar sin stock aquí'}
            onClick={onToggleStock}
          >
            <svg className="icon" style={{ width: 12, height: 12 }} viewBox="0 0 24 24"><path d="M3 8l9-5 9 5-9 5-9-5z" /><path d="M3 8v8l9 5 9-5V8M12 13v8" /></svg>
          </button>
          <button type="button" className="icon-btn" aria-label="Editar" onClick={onEdit}>
            <svg className="icon" style={{ width: 12, height: 12 }} viewBox="0 0 24 24"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
          </button>
          <button type="button" className="icon-btn danger" aria-label="Eliminar" onClick={onDelete}>
            <svg className="icon" style={{ width: 12, height: 12 }} viewBox="0 0 24 24"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
