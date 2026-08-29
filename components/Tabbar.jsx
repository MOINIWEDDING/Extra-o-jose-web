'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Inicio', icon: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /> },
  { href: '/menu', label: 'Menú', icon: <path d="M5 7h14M5 12h14M5 17h9" /> },
  { href: '/nosotros', label: 'Nosotros', icon: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></> },
  { href: '/visitanos', label: 'Visítanos', icon: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.3" /></> },
];

export default function Tabbar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={pathname === t.href ? 'current' : ''}>
          <svg viewBox="0 0 24 24">{t.icon}</svg>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
