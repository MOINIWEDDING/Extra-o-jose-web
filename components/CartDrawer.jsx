'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useBranch } from '@/context/BranchContext';
import { useGuestInfo } from '@/context/GuestInfoContext';
import { useTables } from '@/hooks/useTables';
import { money } from '@/hooks/useMenuItems';
import { useToast } from '@/context/ToastContext';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';

const DELIVERY = 0; // no hay delivery real todavía; se sirve en el local

const PAYMENT_METHODS = [
  { id: 'google_pay', label: 'Google Pay', ready: false },
  { id: 'apple_pay', label: 'Apple Pay', ready: false },
  { id: 'gift_card', label: 'Gift Card', ready: true },
  { id: 'tarjeta', label: 'Tarjeta de crédito', ready: true },
];

export default function CartDrawer() {
  const { lines, subtotal, setQty, setNotes, removeItem, clear, tableNumber, setTableNumber, customerName, setCustomerName, drawerOpen, closeDrawer } = useCart();
  const { profile, refreshProfile } = useAuth();
  const { branch, branchInfo } = useBranch();
  const { tables } = useTables(branch);
  const guestInfo = useGuestInfo();
  const { showToast } = useToast();
  const [promo, setPromo] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const [success, setSuccess] = useState(false);

  // El sexo/edad del invitado se recolectan al entrar (después de "Continuar
  // como invitado"), nunca aquí en el checkout — si por algo faltan, el pedido
  // simplemente se manda sin ese dato, no se interrumpe la compra por eso.
  const effectiveGender = profile ? profile.gender : guestInfo.gender;
  const effectiveAge = profile ? profile.age : guestInfo.age;

  const effectiveName = customerName || (profile ? profile.name : '') || '';
  const total = subtotal + DELIVERY;

  async function handlePay(method) {
    if (!lines.length) return;
    const chosen = PAYMENT_METHODS.find((m) => m.id === method);
    if (!chosen.ready) {
      showToast(`${chosen.label} llega pronto — por ahora paga con tarjeta de crédito.`);
      return;
    }
    if (!tableNumber) { setPlaceError('Elige tu mesa antes de continuar.'); return; }
    if (!effectiveName.trim()) { setPlaceError('Escribe tu nombre antes de continuar.'); return; }
    if (!branch) { setPlaceError('Elige la sucursal antes de continuar.'); return; }

    if (method === 'gift_card') {
      if (!profile) { setPlaceError('Inicia sesión para pagar con tu gift card.'); return; }
      if ((profile.gift_card_balance || 0) < total) {
        setPlaceError(`No te alcanza el balance de gift card (tienes ${money(profile.gift_card_balance || 0)}, el total es ${money(total)}). Elige otro método o completa el pago con tarjeta.`);
        return;
      }
    }

    setPlaceError('');
    setPlacing(true);

    if (method === 'gift_card' && BARRO_CONFIGURED) {
      const { error: payError } = await sb.rpc('pay_with_gift_card', { amount_input: total });
      if (payError) { setPlaceError(payError.message.replace('exception: ', '')); setPlacing(false); return; }
    }

    const payload = {
      customer_name: effectiveName.trim(),
      table_number: tableNumber,
      items: lines.map((l) => ({ id: l.id, name: l.name, price: l.price, qty: l.qty, notes: l.notes || '' })),
      subtotal,
      payment_method: method,
      user_id: profile ? profile.id : null,
      branch,
      customer_gender: effectiveGender || null,
      customer_age: effectiveAge || null,
    };

    if (BARRO_CONFIGURED) {
      const { error } = await sb.from('orders').insert(payload);
      if (error) { setPlaceError('No se pudo enviar el pedido: ' + error.message); setPlacing(false); return; }
    }

    if (method === 'gift_card') await refreshProfile();

    setPlacing(false);
    setSuccess(true);
    clear();
    setTimeout(() => { setSuccess(false); closeDrawer(); }, 2600);
  }

  function handleClose() {
    if (success) return; // deja que la animación termine
    closeDrawer();
  }

  return (
    <AnimatePresence>
      {drawerOpen && (
        <motion.div
          className="overlay show"
          style={{ alignItems: 'flex-end' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            className="modal cart-modal"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {success ? (
              <div className="order-success">
                <motion.div
                  className="order-check"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
                >
                  <motion.svg viewBox="0 0 24 24" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
                    <path d="M5 13l4 4L19 7" />
                  </motion.svg>
                </motion.div>
                <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  ¡Muchas gracias por tu compra!
                </motion.h3>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                  Tu pedido ya va camino a {tableNumber}.
                </motion.p>
              </div>
            ) : (
              <>
                <div className="modal-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 60 }}>
                  <h3 style={{ margin: 0 }}>Carrito</h3>
                  {lines.length > 0 && (
                    <button type="button" className="icon-btn" aria-label="Vaciar carrito" onClick={clear}>
                      <svg className="icon" viewBox="0 0 24 24"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></svg>
                    </button>
                  )}
                </div>
                <button type="button" className="modal-close" onClick={handleClose} aria-label="Cerrar">
                  <svg className="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>

                <div className="modal-body">
                  {lines.length === 0 ? (
                    <p className="empty-note">Tu carrito está vacío. Agrega algo desde el menú.</p>
                  ) : (
                    <>
                      <div className="cart-lines">
                        {lines.map((l) => (
                          <div className="cart-line-block" key={l.id}>
                            <div className="cart-line">
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
                            <input
                              type="text"
                              className="cart-line-notes"
                              placeholder="Alguna nota para este producto (ej. sin azúcar)…"
                              value={l.notes || ''}
                              onChange={(e) => setNotes(l.id, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="checkout-fields">
                        <div className="field">
                          <label htmlFor="cartName">Tu nombre</label>
                          <input id="cartName" type="text" placeholder="¿A nombre de quién?" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                        </div>
                        <div className="field">
                          <label htmlFor="cartTable">Tu mesa</label>
                          <select id="cartTable" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)}>
                            <option value="">Elige tu mesa…</option>
                            {tables.map((t) => <option key={t.id} value={t.label}>{t.label}</option>)}
                          </select>
                        </div>
                      </div>
                      {branch && (
                        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Pidiendo en: {branchInfo?.full}</p>
                      )}

                      <div className="promo-row">
                        <input type="text" placeholder="Código promocional" value={promo} onChange={(e) => setPromo(e.target.value)} />
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => showToast('Los códigos promocionales llegan pronto.')}>Aplicar</button>
                      </div>

                      <div className="cart-totals">
                        <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
                        <div><span>Entrega</span><span>{DELIVERY === 0 ? 'En el local' : money(DELIVERY)}</span></div>
                        <div className="cart-total-final"><span>Total</span><span>{money(subtotal + DELIVERY)}</span></div>
                      </div>

                      {placeError && <div className="form-msg show error" style={{ marginTop: 14 }}>{placeError}</div>}

                      <p className="pay-label">
                        Elige cómo pagar
                        {profile && <span className="muted" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}> · tu balance de gift card: {money(profile.gift_card_balance || 0)}</span>}
                      </p>
                      <div className="pay-grid">
                        {PAYMENT_METHODS.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className={`pay-btn${m.ready ? ' ready' : ''}`}
                            disabled={placing}
                            onClick={() => handlePay(m.id)}
                          >
                            {m.label}
                            {!m.ready && <span className="pay-soon">Próximamente</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
