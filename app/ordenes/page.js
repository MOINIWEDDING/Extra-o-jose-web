'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useOrdersNotify } from '@/context/OrdersNotifyContext';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';
import { money } from '@/hooks/useMenuItems';

const STATUS_LABELS = {
  nueva: 'Nueva',
  en_preparacion: 'En preparación',
  lista: 'Lista',
  entregada: 'Entregada',
};
const STATUS_ORDER = ['nueva', 'en_preparacion', 'lista', 'entregada'];

function timeAgo(dateStr) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.round(mins / 60);
  return `hace ${hrs} h`;
}

export default function OrdenesPage() {
  const { profile, isStaff } = useAuth();
  const { markSeen } = useOrdersNotify();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!BARRO_CONFIGURED) { setOrders([]); setLoading(false); return; }
    const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(!error && data ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (profile && !isStaff) router.push('/');
  }, [profile, isStaff, router]);

  useEffect(() => { markSeen(); }, [markSeen]);

  useEffect(() => {
    load();
    if (!BARRO_CONFIGURED) return undefined;
    const channel = sb
      .channel('orders-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [load]);

  async function updateStatus(id, status) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (BARRO_CONFIGURED) await sb.from('orders').update({ status }).eq('id', id);
  }

  if (!profile) return null;
  if (!isStaff) return null;

  return (
    <section className="ordenes-page">
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: 30 }}>
          <p className="eyebrow">Panel del dueño</p>
          <h2 style={{ fontSize: 24 }}>Órdenes</h2>
          <p>Los pedidos de los clientes llegan aquí en tiempo real, con sonido incluido.</p>
        </div>

        {loading ? null : orders.length === 0 ? (
          <p className="empty-note">Todavía no hay pedidos.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                className="order-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="order-card-top">
                  <div>
                    <h4>{order.customer_name}</h4>
                    <span className="order-meta">Mesa {order.table_number} · {timeAgo(order.created_at)}</span>
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
                  <select
                    className="order-status"
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                  >
                    {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
