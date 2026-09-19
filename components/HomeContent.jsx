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

export default function HomeContent() {
  const { categories } = useCategories();
  const { isStaff, isComensal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // A clientes e invitados ya no se les manda a la pantalla de inicio de
    // sesión al entrar — eso queda solo para cuando entren a "Cuenta" por
    // su cuenta. Aquí, directo al menú (el dueño/comensal ven Inicio normal).
    if (isStaff || isComensal) return;
    if (!FEATURES.ordering) router.push('/menu');
  }, [isStaff, isComensal, router]);

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
