'use client';
import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';
import OffersCarousel from './OffersCarousel';
import CategoryCarousels from './CategoryCarousels';
import ProductIcon from './ProductIcon';
import Reveal from './Reveal';
import WelcomeScreen from './WelcomeScreen';

export default function HomeContent() {
  const { categories } = useCategories();

  return (
    <>
      <WelcomeScreen />
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
          <CategoryCarousels limit={6} showAddCategory />
        </div>
      </section>
    </>
  );
}
