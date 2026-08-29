import EditablePhoto from '@/components/EditablePhoto';
import Reveal from '@/components/Reveal';

export const metadata = { title: 'Nosotros — El Extraño José' };

export default function NosotrosPage() {
  return (
    <>
      <section className="historia" id="nosotros" style={{ paddingTop: 28 }}>
        <div className="wrap historia-grid">
          <Reveal className="historia-photos">
            <EditablePhoto imgKey="founder" label="Foto del fundador" className="main" />
            <EditablePhoto imgKey="gallery-2" className="detail" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow">Origen y fundador</p>
            <h2 style={{ fontSize: 26, marginTop: 10 }}>
              Un café <em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>diferente</em>, a tu manera.
            </h2>
            <p style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              El proyecto fue impulsado y registrado formalmente a mediados de 2022 por su creador, José Frandariel
              Alcántara Castellanos. El nombre del local es un guiño directo a su fundador: abrazar la idea de ser
              un espacio &quot;diferente&quot; frente a las franquicias tradicionales.
            </p>
            <div className="founder-tag">
              <div className="av">JF</div>
              <div><b>José Frandariel Alcántara</b><span>Fundador · 2022</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pilares">
        <div className="wrap">
          <Reveal className="section-head">
            <p className="eyebrow">El concepto</p>
            <h2>Especialidad y bohemia.</h2>
            <p>Desde sus inicios, el lugar fue concebido bajo dos pilares.</p>
          </Reveal>
          <div className="pilar-grid">
            <Reveal className="pilar-card" delay={0}>
              <div className="pilar-num">01</div>
              <h3>Café de especialidad</h3>
              <p>El enfoque está en el specialty coffee: origen del grano dominicano, métodos de extracción y técnica del barista.</p>
            </Reveal>
            <Reveal className="pilar-card" delay={0.1}>
              <div className="pilar-num">02</div>
              <h3>Atmósfera artística</h3>
              <p>Una experiencia bohemia. Diseño industrial con toques acogedores, pensado para creativos, estudiantes y profesionales.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="azotea" id="azotea">
        <div className="wrap azotea-grid">
          <Reveal style={{ position: 'relative' }}>
            <div className="azotea-badge">El rincón<br />favorito</div>
            <EditablePhoto imgKey="azotea" label="Foto de la azotea" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow">El rincón favorito</p>
            <h2 style={{ fontSize: 26, marginTop: 10 }}>La azotea, donde todo se queda un rato más.</h2>
            <p className="body">
              Industrial por dentro, acogedora por fuera. Se ha convertido en el rincón favorito para conversar,
              trabajar o ver pasar el día — con una taza siempre a la mano.
            </p>
            <a href="/visitanos" className="btn btn-ghost-light btn-block" style={{ marginTop: 20 }}>Reservar un espacio</a>
          </Reveal>
        </div>
      </section>

      <section className="cultura">
        <div className="wrap">
          <Reveal className="section-head">
            <p className="eyebrow">Cultura cafetera</p>
            <h2>No solo servimos tazas de café.</h2>
            <p>Somos aliados de la educación cafetera en la Ciudad Corazón.</p>
          </Reveal>
          <div className="cultura-list">
            <Reveal as="div" className="cultura-item" delay={0}>
              <span className="cultura-tag">Sede de eventos</span>
              <div>
                <h4>Escuela de Café de RD</h4>
                <p>Colaboramos con la Escuela de Café de República Dominicana, prestando el espacio y la barra para formación y encuentros.</p>
              </div>
            </Reveal>
            <Reveal as="div" className="cultura-item" delay={0.08}>
              <span className="cultura-tag">Catas</span>
              <div>
                <h4>Degustaciones de café dominicano</h4>
                <p>Anfitriones de catas exclusivas, explorando origen, proceso y perfil de taza.</p>
              </div>
            </Reveal>
            <Reveal as="div" className="cultura-item" delay={0.16}>
              <span className="cultura-tag">Experimental</span>
              <div>
                <h4>Caviar de café y aperitivos de autor</h4>
                <p>Experiencias gastronómicas alrededor del grano, con degustaciones únicas pensadas para sorprender.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="espacio">
        <div className="wrap">
          <Reveal className="section-head">
            <p className="eyebrow">El local</p>
            <h2>Un vistazo por dentro.</h2>
            <p>Desliza para ver más.</p>
          </Reveal>
          <div className="espacio-grid">
            <EditablePhoto imgKey="gallery-0" label="La barra" />
            <EditablePhoto imgKey="gallery-1" label="El salón" />
            <EditablePhoto imgKey="gallery-2" label="Nuestro café" />
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="footer-bottom" style={{ border: 'none', paddingTop: 0 }}>
            <span>© {new Date().getFullYear()} El Extraño José.</span>
            <span><a href="/">Volver al inicio</a></span>
          </div>
        </div>
      </footer>
    </>
  );
}
