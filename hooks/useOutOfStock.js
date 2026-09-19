'use client';
import { useState, useEffect, useCallback } from 'react';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';

export function useOutOfStock(branch) {
  const [outOfStockIds, setOutOfStockIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (!BARRO_CONFIGURED || !branch) { setOutOfStockIds(new Set()); setLoading(false); return; }
    const { data, error } = await sb.from('out_of_stock').select('item_id').eq('branch', branch);
    setOutOfStockIds(!error && data ? new Set(data.map((r) => r.item_id)) : new Set());
    setLoading(false);
  }, [branch]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (itemId) => {
    if (!BARRO_CONFIGURED || !branch) return;
    const isOut = outOfStockIds.has(itemId);
    // optimista, para que se sienta al instante
    setOutOfStockIds((prev) => {
      const next = new Set(prev);
      if (isOut) next.delete(itemId); else next.add(itemId);
      return next;
    });
    if (isOut) {
      await sb.from('out_of_stock').delete().eq('item_id', itemId).eq('branch', branch);
    } else {
      await sb.from('out_of_stock').insert({ item_id: itemId, branch });
    }
  }, [branch, outOfStockIds]);

  return { outOfStockIds, loading, toggle, reload: load };
}
