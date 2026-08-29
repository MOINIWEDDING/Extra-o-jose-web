import MenuCarousels from '@/components/MenuCarousels';

export const metadata = { title: 'Menú — El Extraño José' };

export default function MenuPage() {
  return (
    <>
      <section className="menu-hero">
        <div className="wrap">
          <div className="section-head reveal in" style={{ marginBottom: 0 }}>
            <p className="eyebrow">Carta completa</p>
            <h2>El menú</h2>
            <p style={{ marginTop: 14 }}>
              Métodos de filtrado, espresso, cold brew y experiencias de cata — siempre con grano dominicano.
              El equipo puede añadir o actualizar productos desde aquí.
            </p>
          </div>
        </div>
      </section>

      <section className="menu-page-body">
        <div className="wrap">
          <MenuCarousels />
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
