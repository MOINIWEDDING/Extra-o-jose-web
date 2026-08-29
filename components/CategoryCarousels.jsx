'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useUploader } from '@/hooks/useUploader';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useCategories } from '@/hooks/useCategories';
import { slugify } from '@/lib/slugify';
import ProductCard from './ProductCard';
import ProductIcon, { ICON_KEYS } from './ProductIcon';
import Uploader from './Uploader';
import Modal from './Modal';
import Reveal from './Reveal';

const TINT_OPTIONS = ['manana', 'salado', 'tarde', 'experiencia'];

export default function CategoryCarousels({ limit = null, showAddCategory = true }) {
  const { isStaff } = useAuth();
  const { categories, reload: reloadCategories } = useCategories();
  const { items, reload: reloadItems } = useMenuItems();

  const [editingItem, setEditingItem] = useState(null); // {item, defaultCategory} | null
  const [editingCategory, setEditingCategory] = useState(null); // category | 'new' | null

  const categoriesWithItems = limit
    ? categories.filter((c) => items.some((i) => i.category === c.name))
    : categories; // en el menú completo mostramos incluso categorías vacías (para poder agregarles productos)

  async function reload() { await Promise.all([reloadItems(), reloadCategories()]); }

  return (
    <>
      {categoriesWithItems.map((cat) => (
        <CategorySection
          key={cat.id}
          category={cat}
          items={items.filter((i) => i.category === cat.name).slice(0, limit || undefined)}
          allCount={items.filter((i) => i.category === cat.name).length}
          limited={!!limit}
          onAddProduct={() => setEditingItem({ item: null, defaultCategory: cat.name })}
          onEditProduct={(item) => setEditingItem({ item, defaultCategory: cat.name })}
          onEditCategory={() => setEditingCategory(cat)}
          onDeletedItem={reload}
        />
      ))}

      {isStaff && showAddCategory && (
        <Reveal className="carousel-section">
          <button type="button" className="add-category-btn" onClick={() => setEditingCategory('new')}>
            <span className="plus"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></span>
            Agregar categoría nueva (ej. Populares)
          </button>
        </Reveal>
      )}

      <AnimatePresence>
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
    </>
  );
}

function CategorySection({ category, items, allCount, limited, onAddProduct, onEditProduct, onEditCategory, onDeletedItem }) {
  const { isStaff } = useAuth();
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const slug = slugify(category.name);

  function update() {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4 || max <= 4);
  }
  useEffect(() => { update(); }, [items.length]); // eslint-disable-line

  function scrollBy(dir) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: 'smooth' });
  }

  async function handleDelete(item) {
    if (BARRO_CONFIGURED) {
      const { error } = await sb.from('menu_items').delete().eq('id', item.id);
      if (error) { alert('No se pudo eliminar: ' + error.message); return; }
    }
    await onDeletedItem();
  }

  const isEmpty = items.length === 0;

  return (
    <Reveal className="carousel-section" id={slug} style={{ scrollMarginTop: 76 }}>
      <div className="carousel-head">
        <h3>
          <span className="cat-head-icon" style={{ background: `var(--tint-${category.tint})` }}>
            <ProductIcon name={category.icon} />
          </span>
          {category.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {limited && allCount > items.length && (
            <Link href={`/menu#${slug}`} className="see-all">Ver todo</Link>
          )}
          {isStaff && !limited && (
            <button type="button" className="icon-btn" aria-label="Editar categoría" onClick={onEditCategory}>
              <svg className="icon" style={{ width: 14, height: 14 }} viewBox="0 0 24 24"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
            </button>
          )}
        </div>
      </div>

      {isEmpty && !isStaff ? null : (
        <div className="carousel-wrap">
          {!isEmpty && (
            <button type="button" className="carousel-arrow left" disabled={atStart} aria-label="Anterior" onClick={() => scrollBy('left')}>
              <svg className="icon" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
          )}
          <div className="carousel-track" ref={trackRef} onScroll={update}>
            {items.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                tint={category.tint}
                onEdit={isStaff ? onEditProduct : undefined}
                onDelete={isStaff ? handleDelete : undefined}
              />
            ))}
            {isStaff && !limited && (
              <button type="button" className="add-card" onClick={onAddProduct}>
                <div className="plus"><svg className="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></div>
                <span>Agregar producto</span>
              </button>
            )}
          </div>
          {!isEmpty && (
            <button type="button" className="carousel-arrow right" disabled={atEnd} aria-label="Siguiente" onClick={() => scrollBy('right')}>
              <svg className="icon" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      )}
    </Reveal>
  );
}

function ProductModal({ item, defaultCategory, categories, onClose, onSaved }) {
  const uploader = useUploader({ requireTransparent: true });
  const [name, setName] = useState(item ? item.name : '');
  const [price, setPrice] = useState(item ? item.price : '');
  const [category, setCategory] = useState(item ? item.category : defaultCategory);
  const [tags, setTags] = useState(item ? (item.tags || '') : '');
  const [description, setDescription] = useState(item ? (item.description || '') : '');
  const [featured, setFeatured] = useState(item ? !!item.featured : false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => { if (item && item.image_url) uploader.setUrl(item.image_url); }, []); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (!name.trim() || Number.isNaN(priceNum)) { setMsg({ text: 'Completa el nombre y el precio.', type: 'error' }); return; }
    if (!BARRO_CONFIGURED) { setMsg({ text: 'Conecta Supabase para guardar cambios de verdad.', type: 'error' }); return; }
    const payload = { name: name.trim(), price: priceNum, category, image_url: uploader.url, tags: tags.trim(), description: description.trim(), featured };
    let error;
    if (item) {
      payload.updated_at = new Date().toISOString();
      ({ error } = await sb.from('menu_items').update(payload).eq('id', item.id));
    } else {
      ({ error } = await sb.from('menu_items').insert(payload));
    }
    if (error) { setMsg({ text: error.message, type: 'error' }); return; }
    await onSaved();
    onClose();
  }

  return (
    <Modal onClose={onClose} wide>
      <div className="modal-top">
        <p className="eyebrow">Menú</p>
        <h3>{item ? 'Editar producto' : 'Agregar producto'}</h3>
      </div>
      <div className="modal-body">
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field"><label htmlFor="pName">Nombre del plato o bebida</label>
              <input id="pName" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field"><label htmlFor="pPrice">Precio (RD$)</label>
              <input id="pPrice" type="number" min="0" step="1" inputMode="numeric" required value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>
          <div className="field"><label htmlFor="pCat">Categoría</label>
            <select id="pCat" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Foto del producto</label><Uploader uploader={uploader} requireTransparent /></div>
          <div className="field"><label htmlFor="pTags">Etiquetas (separadas por coma)</label>
            <input id="pTags" type="text" placeholder="Dominicano, Filtrado, Frutal" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="field"><label htmlFor="pDesc">Descripción corta</label>
            <textarea id="pDesc" placeholder="Origen del grano, método, notas de sabor…" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
            <input id="pFeatured" type="checkbox" style={{ width: 'auto' }} checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <label htmlFor="pFeatured" style={{ margin: 0, textTransform: 'none', fontSize: 13, letterSpacing: 0, fontWeight: 500, color: 'var(--ink)' }}>Marcar como favorito</label>
          </div>
          {msg.text && <div className={`form-msg show ${msg.type}`}>{msg.text}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-amber">{item ? 'Guardar cambios' : 'Guardar producto'}</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function CategoryModal({ category, onClose, onSaved }) {
  const [name, setName] = useState(category ? category.name : '');
  const [icon, setIcon] = useState(category ? category.icon : 'coffee');
  const [tint, setTint] = useState(category ? category.tint : 'manana');
  const [msg, setMsg] = useState({ text: '', type: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setMsg({ text: 'Escribe un nombre.', type: 'error' }); return; }
    if (!BARRO_CONFIGURED) { setMsg({ text: 'Conecta Supabase para guardar cambios de verdad.', type: 'error' }); return; }
    const payload = { name: name.trim(), icon, tint };
    let error;
    if (category) {
      ({ error } = await sb.from('categories').update(payload).eq('id', category.id));
    } else {
      const { data: existing } = await sb.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1);
      payload.sort_order = existing && existing[0] ? existing[0].sort_order + 1 : 1;
      ({ error } = await sb.from('categories').insert(payload));
    }
    if (error) { setMsg({ text: error.message, type: 'error' }); return; }
    await onSaved();
    onClose();
  }

  async function handleDelete() {
    if (!BARRO_CONFIGURED) { onClose(); return; }
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"? Los productos que tenga no se borran, pero quedarán sin categoría visible hasta que les asignes otra.`)) return;
    const { error } = await sb.from('categories').delete().eq('id', category.id);
    if (error) { setMsg({ text: error.message, type: 'error' }); return; }
    await onSaved();
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <div className="modal-top">
        <p className="eyebrow">Categorías</p>
        <h3>{category ? 'Editar categoría' : 'Agregar categoría'}</h3>
        <p className="modal-sub">Aparece tanto en el inicio como en el menú.</p>
      </div>
      <div className="modal-body">
        <form onSubmit={handleSubmit}>
          <div className="field"><label htmlFor="catName">Nombre</label>
            <input id="catName" type="text" placeholder="Populares" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field"><label>Ícono</label>
            <div className="icon-picker">
              {ICON_KEYS.map((k) => (
                <button type="button" key={k} className={`icon-pick${icon === k ? ' active' : ''}`} onClick={() => setIcon(k)}>
                  <ProductIcon name={k} />
                </button>
              ))}
            </div>
          </div>
          <div className="field"><label>Color</label>
            <div className="tint-picker">
              {TINT_OPTIONS.map((t) => (
                <button type="button" key={t} className={`tint-pick${tint === t ? ' active' : ''}`} style={{ background: `var(--tint-${t})` }} onClick={() => setTint(t)} aria-label={t} />
              ))}
            </div>
          </div>
          {msg.text && <div className={`form-msg show ${msg.type}`}>{msg.text}</div>}
          <div className="modal-actions">
            {category
              ? <button type="button" className="btn btn-ghost" onClick={handleDelete} style={{ color: 'var(--err)' }}>Eliminar categoría</button>
              : <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>}
            <button type="submit" className="btn btn-amber">Guardar</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
