'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'ej-cart-v1';

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]); // [{id, name, price, image_url, qty, notes}]
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setLines(parsed.lines || []);
        setTableNumber(parsed.tableNumber || '');
        setCustomerName(parsed.customerName || '');
      }
    } catch (e) { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, tableNumber, customerName })); } catch (e) { /* ignore */ }
  }, [lines, tableNumber, customerName, loaded]);

  const addItem = useCallback((item, qty = 1) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, image_url: item.image_url, qty, notes: '', is_beverage: !!item.is_beverage }];
    });
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback((id, qty) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.id !== id);
      return prev.map((l) => (l.id === id ? { ...l, qty } : l));
    });
  }, []);

  const setNotes = useCallback((id, notes) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));
  }, []);

  const removeItem = useCallback((id) => setLines((prev) => prev.filter((l) => l.id !== id)), []);

  const clear = useCallback(() => {
    setLines([]);
    setTableNumber('');
    // el nombre del cliente se mantiene para la próxima vez, no hace falta pedirlo de nuevo
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.qty * l.price, 0), [lines]);

  return (
    <CartContext.Provider value={{
      lines, count, subtotal, addItem, setQty, setNotes, removeItem, clear,
      tableNumber, setTableNumber, customerName, setCustomerName,
      drawerOpen, openDrawer, closeDrawer,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
