import { Suspense } from 'react';
import ProductBrowser from '@/components/ProductBrowser';

export const metadata = { title: 'Menú — El Extraño José' };

export default function MenuPage() {
  return (
    <>
      <section className="menu-page-body" style={{ paddingTop: 28 }}>
        <div className="wrap">
          <Suspense fallback={null}>
            <ProductBrowser />
          </Suspense>
        </div>
      </section>

      <footer>
        <div className="wrap footer-bottom" style={{ border: 'none', paddingTop: 0 }}>
          <span>© {new Date().getFullYear()} El Extraño José. Todos los derechos reservados.</span>
          <span><a href="/">Volver al inicio</a></span>
        </div>
      </footer>
    </>
  );
}
