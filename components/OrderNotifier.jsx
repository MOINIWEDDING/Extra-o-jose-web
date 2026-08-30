'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useOrdersNotify } from '@/context/OrdersNotifyContext';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';
import { playNotificationSound } from '@/lib/notificationSound';
import { money } from '@/hooks/useMenuItems';

export default function OrderNotifier() {
  const { isStaff } = useAuth();
  const { showToast } = useToast();
  const { notifyNewOrder } = useOrdersNotify();

  useEffect(() => {
    if (!isStaff || !BARRO_CONFIGURED) return undefined;

    const channel = sb
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const order = payload.new;
        playNotificationSound();
        notifyNewOrder();
        showToast(`Nuevo pedido de ${order.customer_name} · Mesa ${order.table_number} · ${money(order.subtotal)}`);
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [isStaff, showToast, notifyNewOrder]);

  return null;
}
