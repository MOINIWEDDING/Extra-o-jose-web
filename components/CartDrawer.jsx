'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { money } from '@/hooks/useMenuItems';
import { useToast } from '@/context/ToastContext';

const DELIVERY = 0; // no hay delivery real todavía; se pide en la barra

export default function CartDrawer() {
  const { lines, subtotal, setQty, removeItem, clear, drawerOpen, closeDrawer } = useCart();
  const { showToast } = useToast();
  const [promo, setPromo] = useState('');

  function handleCheckout() {
    showToast('Por ahora los pedidos se confirman en la barra — ¡muéstrale esta lista al barista! ☕');
    closeDrawer();
  }

  return (
    <AnimatePresence>
      {drawerOpen && (
        <motion.div
          className="overlay show"
          style={{ alignItems: 'flex-end' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeDrawer(); }}
        >
          <motion.div
            className="modal cart-modal"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="modal-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 60 }}>
              <h3 style={{ margin: 0 }}>Carrito</h3>
              {lines.length > 0 && (
                <button type="button" className="icon-btn" aria-label="Vaciar carrito" onClick={clear}>
                  <svg className="icon" viewBox="0 0 24 24"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></svg>
                </button>
              )}
            </div>
            <button type="button" className="modal-close" onClick={closeDrawer} aria-label="Cerrar">
              <svg className="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>

            <div className="modal-body">
              {lines.length === 0 ? (
                <p className="empty-note">Tu carrito está vacío. Agrega algo desde el menú.</p>
              ) : (
                <>
                  <div className="cart-lines">
                    {lines.map((l) => (
                      <div className="cart-line" key={l.id}>
                        <div className="cart-line-photo">
                          {l.image_url ? <img src={l.image_url} alt={l.name} /> : null}
                        </div>
                        <div className="cart-line-body">
                          <h4>{l.name}</h4>
                          <span className="cart-line-price">{money(l.price)}</span>
                        </div>
                        <div className="qty-stepper">
                          <button type="button" onClick={() => setQty(l.id, l.qty - 1)} aria-label="Menos">–</button>
                          <span>{l.qty}</span>
                          <button type="button" onClick={() => setQty(l.id, l.qty + 1)} aria-label="Más">+</button>
                        </div>
                        <button type="button" className="cart-line-remove" onClick={() => removeItem(l.id)} aria-label="Quitar">
                          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="promo-row">
                    <input type="text" placeholder="Código promocional" value={promo} onChange={(e) => setPromo(e.target.value)} />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => showToast('Los códigos promocionales llegan pronto.')}>Aplicar</button>
                  </div>

                  <div className="cart-totals">
                    <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
                    <div><span>Entrega</span><span>{DELIVERY === 0 ? 'En el local' : money(DELIVERY)}</span></div>
                    <div className="cart-total-final"><span>Total</span><span>{money(subtotal + DELIVERY)}</span></div>
                  </div>

                  <button type="button" className="btn btn-amber btn-block" style={{ marginTop: 18 }} onClick={handleCheckout}>
                    Confirmar pedido · {money(subtotal + DELIVERY)}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
