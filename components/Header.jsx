'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/menu', label: 'Menú' },
  { href: '/visitanos', label: 'Visítanos' },
];

function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export default function Header() {
  const pathname = usePathname();
  const { profile, openAuth, logout } = useAuth();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    function onScroll() { setSolid(window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header id="siteHeader" className={solid ? 'solid' : ''}>
      <div className="wrap">
        <div className="logo"><span className="dot" />El Extraño José</div>
        <nav className="links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? 'current' : ''}>{l.label}</Link>
          ))}
        </nav>
        <div className="nav-right">
          {!profile ? (
            <button type="button" className="btn btn-amber btn-sm" onClick={() => openAuth('login', 'cliente')}>
              <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>
              Iniciar sesión
            </button>
          ) : (
            <>
              <div className="user-chip">
                <div className="av">{initials(profile.name)}</div>
                <div>{profile.name}</div>
                <span className="role-tag">{profile.role === 'staff' ? 'Comensal · Dueño' : 'Cliente'}</span>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>Salir</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
