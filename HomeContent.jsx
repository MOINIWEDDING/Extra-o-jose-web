'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { FEATURES } from '@/lib/features';
import OffersCarousel from './OffersCarousel';
import CategoryCarousels from './CategoryCarousels';
import ProductIcon from './ProductIcon';
import Reveal from './Reveal';

const SEEN_KEY = 'ej-welcome-seen';

export default function HomeContent() {
  const { categories } = useCategories();
  const { profile, isStaff, isComensal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Mientras los pedidos por la web están apagados, a clientes e invitados
    // no se les muestra este Inicio (pensado para pedir) — solo el Menú.
    // El dueño y el comensal sí lo siguen viendo con normalidad.
    if (isStaff || isComensal) return;

    let seen = false;
    try { seen = window.sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) { /* ignore */ }
    if (!profile && !seen) {
      try { window.sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* ignore */ }
      router.push('/cuenta');
      return;
    }
    if (!FEATURES.ordering) router.push('/menu');
  }, [profile, isStaff, isComensal, router]);

  return (
    <>
      <section className="home-top">
        <div className="wrap">
          <div className="home-greet">Bienvenido a<strong>El Extraño José</strong></div>

          <OffersCarousel />

          <Reveal as="div" className="cat-row">
            {categories.map((c) => (
              <Link key={c.id} className="cat-item" href={`/menu?cat=${encodeURIComponent(c.name)}`}>
                <div className="cat-icon" style={{ background: `var(--tint-${c.tint})` }}>
                  <ProductIcon name={c.icon} />
                </div>
                <span>{c.name}</span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <CategoryCarousels limit={null} showAddCategory />
        </div>
      </section>
    </>
  );
}
