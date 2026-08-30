'use client';
import { useState, useEffect, useCallback } from 'react';
import { sb, BARRO_CONFIGURED } from '@/lib/supabaseClient';

export function demoMenu() {
  return [
    { id: 'd1', name: 'V60 grano dominicano', category: 'Buenos días', price: 250, featured: true, tags: 'Dominicano,Filtrado,Frutal', image_url: 'https://images.unsplash.com/photo-1753837787691-84a06d715d24?q=80&w=700&h=700&fit=crop&crop=entropy&auto=format' },
    { id: 'd2', name: 'Chemex para dos', category: 'Buenos días', price: 420, featured: false, tags: 'Para compartir,Filtrado', image_url: 'https://images.unsplash.com/photo-1758593386033-cb1f842d550c?q=80&w=700&h=700&fit=crop&crop=entropy&auto=format' },
    { id: 'd3', name: 'Espresso doble origen', category: 'Buenos días', price: 150, featured: false, tags: 'Doble shot,Intenso', image_url: 'https://images.unsplash.com/photo-1498241804937-a517467c0db6?q=80&w=700&h=700&fit=crop&crop=entropy&auto=format' },
    { id: 'd4', name: 'Tostada de aguacate', category: 'Salados', price: 320, featured: false, tags: 'Vegetariano,Masa madre', image_url: 'https://images.unsplash.com/photo-1752095809157-9dd2e2dfae8b?q=80&w=700&h=700&fit=crop&crop=entropy&auto=format' },
    { id: 'd5', name: 'Sandwich de la barra', category: 'Salados', price: 380, featured: false, tags: 'Jamón serrano,Manchego', image_url: 'https://images.unsplash.com/photo-1696721497656-682d1376c3c8?q=80&w=700&h=700&fit=crop&crop=entropy&auto=format' },
    { id: 'd6', name: 'Flat white de autor', category: 'Para la tarde', price: 210, featured: true, tags: 'Cremoso,Espresso', image_url: 'https://images.unsplash.com/photo-1758900450186-e829f72d25fb?q=80&w=700&h=700&fit=crop&crop=entropy&auto=format' },
    { id: 'd7', name: 'Cold brew 24h', category: 'Para la tarde', price: 220, featured: false, tags: 'Frío,24 horas', image_url: 'https://images.unsplash.com/photo-1759259639356-6eee63241869?q=80&w=700&h=700&fit=crop&crop=entropy&auto=format' },
    { id: 'd8', name: 'Cata guiada', category: 'Experiencias', price: 650, featured: false, tags: 'Grupal,Tres orígenes', image_url: 'https://images.unsplash.com/photo-1758945185175-3d54780cd8d0?q=80&w=700&h=700&fit=crop&crop=entropy&auto=format' },
  ];
}

export function money(n) { return Number(n).toLocaleString('es-DO') + '$'; }

export function useMenuItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (!BARRO_CONFIGURED) { setItems(demoMenu()); setLoading(false); return; }
    const { data, error } = await sb.from('menu_items').select('*').order('created_at', { ascending: true });
    if (error) { setItems(demoMenu()); setLoading(false); return; }
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { items, loading, reload: load };
}
