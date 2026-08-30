'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';
import { playNotificationSound } from '@/lib/notificationSound';
import { money } from '@/hooks/useMenuItems';

export default function GiftCardNotifier() {
  const { isStaff } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isStaff || !BARRO_CONFIGURED) return undefined;

    const channel = sb
      .channel('gift-cards-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gift_cards' }, (payload) => {
        const gc = payload.new;
        playNotificationSound();
        showToast(`${gc.buyer_name || 'Alguien'} compró una gift card de ${money(gc.amount)} 🎁`);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'gift_cards' }, (payload) => {
        const gc = payload.new;
        const prev = payload.old;
        if (prev.status !== 'canjeada' && gc.status === 'canjeada') {
          playNotificationSound();
          showToast(`${gc.redeemed_by_name || 'Alguien'} canjeó una gift card de ${money(gc.amount)}`);
        }
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [isStaff, showToast]);

  return null;
}
