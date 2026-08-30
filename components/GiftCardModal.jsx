'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { money } from '@/hooks/useMenuItems';

const STEP = 300;
const MIN_AMOUNT = 300;
const MAX_AMOUNT = 3000;

const PAYMENT_METHODS = [
  { id: 'google_pay', label: 'Google Pay', ready: false },
  { id: 'apple_pay', label: 'Apple Pay', ready: false },
  { id: 'gift_card', label: 'Gift Card', ready: false },
  { id: 'tarjeta', label: 'Tarjeta de crédito', ready: true },
];

// Código generado al vuelo, nunca sacado de una lista guardada de antemano.
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin O/0/I/1 para evitar confusiones
  let part = '';
  for (let i = 0; i < 8; i++) part += chars[Math.floor(Math.random() * chars.length)];
  return `EJ-${part.slice(0, 4)}-${part.slice(4)}`;
}

export default function GiftCardModal({ mode = 'buy', onClose, onDone }) {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [amount, setAmount] = useState(MIN_AMOUNT);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // {code, amount} tras comprar | {amount} tras canjear

  async function handlePay(methodId) {
    const chosen = PAYMENT_METHODS.find((m) => m.id === methodId);
    if (!chosen.ready) {
      showToast(`${chosen.label} llega pronto — por ahora paga con tarjeta de crédito.`);
      return;
    }
    if (!BARRO_CONFIGURED) { setError('Conecta Supabase para comprar de verdad.'); return; }
    setBusy(true);
    setError('');
    const newCode = generateCode();
    const { error: insertError } = await sb.from('gift_cards').insert({
      code: newCode,
      amount,
      status: 'activa',
      buyer_user_id: profile.id,
    });
    setBusy(false);
    if (insertError) { setError(insertError.message); return; }
    setResult({ code: newCode, amount });
    if (onDone) onDone();
  }

  async function handleRedeem(e) {
    e.preventDefault();
    if (!code.trim()) { setError('Escribe un código.'); return; }
    if (!BARRO_CONFIGURED) { setError('Conecta Supabase para canjear de verdad.'); return; }
    setBusy(true);
    setError('');
    const { data, error: rpcError } = await sb.rpc('redeem_gift_card', { code_input: code.trim() });
    setBusy(false);
    if (rpcError) { setError(rpcError.message.replace('exception: ', '')); return; }
    setResult({ amount: data });
    await refreshProfile();
    if (onDone) onDone();
  }

  return (
    <AnimatePresence>
      <motion.div className="pd-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className="pd-sheet"
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {result ? (
            <div className="order-success" style={{ padding: '70px 26px 50px' }}>
              <motion.div className="order-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}>
                <motion.svg viewBox="0 0 24 24" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
                  <path d="M5 13l4 4L19 7" />
                </motion.svg>
              </motion.div>
              {mode === 'buy' ? (
                <>
                  <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>¡Gift card creada!</motion.h3>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Guarda este código, es tu comprobante:</motion.p>
                  <motion.div className="giftcard-code" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
                    {result.code}
                  </motion.div>
                  <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>Valor: {money(result.amount)}</p>
                </>
              ) : (
                <>
                  <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>¡Código canjeado!</motion.h3>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Se agregaron {money(result.amount)} a tu balance.</motion.p>
                </>
              )}
              <button type="button" className="btn btn-amber btn-block" style={{ marginTop: 26 }} onClick={onClose}>Listo</button>
            </div>
          ) : mode === 'buy' ? (
            <>
              <div className="pd-hero" style={{ background: 'var(--tint-experiencia)' }}>
                <button type="button" className="pd-back" onClick={onClose} aria-label="Volver">
                  <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
                </button>
                <div className="pd-photo">
                  <div className="pd-photo-empty">
                    <svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18" /><path d="M12 8c-2-3-6-3-6 0s4 2 6 0c2 2 6 2 6 0s-4-3-6 0z" /></svg>
                  </div>
                </div>
              </div>
              <div className="pd-body" style={{ paddingBottom: 40 }}>
                <h2>Gift Card</h2>
                <p className="pd-sub">Elige el monto</p>

                <div className="pd-price-row" style={{ justifyContent: 'center' }}>
                  <div className="qty-stepper amount-stepper">
                    <button type="button" onClick={() => setAmount((a) => Math.max(MIN_AMOUNT, a - STEP))} aria-label="Menos">–</button>
                    <span>{money(amount)}</span>
                    <button type="button" onClick={() => setAmount((a) => Math.min(MAX_AMOUNT, a + STEP))} aria-label="Más">+</button>
                  </div>
                </div>
                <p className="muted" style={{ textAlign: 'center', fontSize: 12, marginTop: 8 }}>De {money(MIN_AMOUNT)} a {money(MAX_AMOUNT)}, de {money(STEP)} en {money(STEP)}.</p>

                <h3 className="pd-section-title">Descripción</h3>
                <p className="pd-desc">
                  Se genera un código único al instante, listo para usar o regalar. Cualquier persona
                  puede canjearlo desde su cuenta para sumarlo a su balance de gift card.
                </p>
                {error && <div className="form-msg show error" style={{ marginTop: 14 }}>{error}</div>}

                <p className="pay-label">Elige cómo pagar</p>
                <div className="pay-grid">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`pay-btn${m.ready ? ' ready' : ''}`}
                      disabled={busy}
                      onClick={() => handlePay(m.id)}
                    >
                      {busy && m.ready ? 'Comprando…' : m.label}
                      {!m.ready && <span className="pay-soon">Próximamente</span>}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="modal-top">
                <p className="eyebrow">Gift card</p>
                <h3>Canjear código</h3>
                <p className="modal-sub">Escribe el código de la gift card para sumar su monto a tu balance.</p>
              </div>
              <div className="modal-body">
                <form onSubmit={handleRedeem}>
                  <div className="field">
                    <label htmlFor="giftCode">Código</label>
                    <input id="giftCode" type="text" placeholder="EJ-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase', letterSpacing: 1 }} />
                  </div>
                  {error && <div className="form-msg show error">{error}</div>}
                  <div className="modal-actions">
                    <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn btn-amber" disabled={busy}>{busy ? 'Canjeando…' : 'Canjear'}</button>
                  </div>
                </form>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
