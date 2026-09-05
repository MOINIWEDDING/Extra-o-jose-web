'use client';
import EditablePhoto from '@/components/EditablePhoto';
import EditableText from '@/components/EditableText';
import Reveal from '@/components/Reveal';
import { SiteContentProvider } from '@/context/SiteContentContext';

export default function NosotrosContent() {
  return (
    <SiteContentProvider>
      <section className="historia" id="nosotros" style={{ paddingTop: 28 }}>
        <div className="wrap historia-grid">
          <Reveal className="historia-photos">
            <EditablePhoto imgKey="founder" label="Foto del fundador" className="main" />
            <EditablePhoto imgKey="gallery-2" className="detail" />
          </Reveal>
          <Reveal delay={0.1}>
            <EditableText contentKey="nosotros.origen.eyebrow" defaultValue="Origen y fundador" as="p" className="eyebrow" />
            <EditableText
              contentKey="nosotros.origen.heading"
              defaultValue="Un café diferente, a tu manera."
              as="h2"
              style={{ fontSize: 26, marginTop: 10 }}
            />
            <EditableText
              contentKey="nosotros.origen.body"
              defaultValue={'El proyecto fue impulsado y registrado formalmente a mediados de 2022 por su creador, José Frandariel Alcántara Castellanos. El nombre del local es un guiño directo a su fundador: abrazar la idea de ser un espacio "diferente" frente a las franquicias tradicionales.'}
              as="p"
              multiline
              style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-soft)' }}
            />
            <div className="founder-tag">
              <div className="av">JF</div>
              <div>
                <EditableText contentKey="nosotros.origen.founder_name" defaultValue="José Frandariel Alcántara" as="b" />
                <EditableText contentKey="nosotros.origen.founder_tag" defaultValue="Fundador · 2022" as="span" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pilares">
        <div className="wrap">
          <Reveal className="section-head">
            <EditableText contentKey="nosotros.pilares.eyebrow" defaultValue="El concepto" as="p" className="eyebrow" />
            <EditableText contentKey="nosotros.pilares.heading" defaultValue="Especialidad y bohemia." as="h2" />
            <EditableText contentKey="nosotros.pilares.sub" defaultValue="Desde sus inicios, el lugar fue concebido bajo dos pilares." as="p" />
          </Reveal>
          <div className="pilar-grid">
            <Reveal className="pilar-card" delay={0}>
              <div className="pilar-num">01</div>
              <EditableText contentKey="nosotros.pilar1.title" defaultValue="Café de especialidad" as="h3" />
              <EditableText
                contentKey="nosotros.pilar1.body"
                defaultValue="El enfoque está en el specialty coffee: origen del grano dominicano, métodos de extracción y técnica del barista."
                as="p" multiline
              />
            </Reveal>
            <Reveal className="pilar-card" delay={0.1}>
              <div className="pilar-num">02</div>
              <EditableText contentKey="nosotros.pilar2.title" defaultValue="Atmósfera artística" as="h3" />
              <EditableText
                contentKey="nosotros.pilar2.body"
                defaultValue="Una experiencia bohemia. Diseño industrial con toques acogedores, pensado para creativos, estudiantes y profesionales."
                as="p" multiline
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="azotea" id="azotea">
        <div className="wrap azotea-grid">
          <Reveal style={{ position: 'relative' }}>
            <div className="azotea-badge">
              <EditableText contentKey="nosotros.azotea.badge" defaultValue="El rincón favorito" as="span" />
            </div>
            <EditablePhoto imgKey="azotea" label="Foto de la azotea" />
          </Reveal>
          <Reveal delay={0.1}>
            <EditableText contentKey="nosotros.azotea.eyebrow" defaultValue="El rincón favorito" as="p" className="eyebrow" />
            <EditableText
              contentKey="nosotros.azotea.heading"
              defaultValue="La azotea, donde todo se queda un rato más."
              as="h2"
              style={{ fontSize: 26, marginTop: 10 }}
            />
            <EditableText
              contentKey="nosotros.azotea.body"
              defaultValue="Industrial por dentro, acogedora por fuera. Se ha convertido en el rincón favorito para conversar, trabajar o ver pasar el día — con una taza siempre a la mano."
              as="p" multiline className="body"
            />
            <a href="/visitanos" className="btn btn-ghost-light btn-block" style={{ marginTop: 20 }}>Reservar un espacio</a>
          </Reveal>
        </div>
      </section>

      <section className="cultura">
        <div className="wrap">
          <Reveal className="section-head">
            <EditableText contentKey="nosotros.cultura.eyebrow" defaultValue="Cultura cafetera" as="p" className="eyebrow" />
            <EditableText contentKey="nosotros.cultura.heading" defaultValue="No solo servimos tazas de café." as="h2" />
            <EditableText contentKey="nosotros.cultura.sub" defaultValue="Somos aliados de la educación cafetera en la Ciudad Corazón." as="p" />
          </Reveal>
          <div className="cultura-list">
            <Reveal as="div" className="cultura-item" delay={0}>
              <EditableText contentKey="nosotros.cultura1.tag" defaultValue="Sede de eventos" as="span" className="cultura-tag" />
              <div>
                <EditableText contentKey="nosotros.cultura1.title" defaultValue="Escuela de Café de RD" as="h4" />
                <EditableText
                  contentKey="nosotros.cultura1.body"
                  defaultValue="Colaboramos con la Escuela de Café de República Dominicana, prestando el espacio y la barra para formación y encuentros."
                  as="p" multiline
                />
              </div>
            </Reveal>
            <Reveal as="div" className="cultura-item" delay={0.08}>
              <EditableText contentKey="nosotros.cultura2.tag" defaultValue="Catas" as="span" className="cultura-tag" />
              <div>
                <EditableText contentKey="nosotros.cultura2.title" defaultValue="Degustaciones de café dominicano" as="h4" />
                <EditableText
                  contentKey="nosotros.cultura2.body"
                  defaultValue="Anfitriones de catas exclusivas, explorando origen, proceso y perfil de taza."
                  as="p" multiline
                />
              </div>
            </Reveal>
            <Reveal as="div" className="cultura-item" delay={0.16}>
              <EditableText contentKey="nosotros.cultura3.tag" defaultValue="Experimental" as="span" className="cultura-tag" />
              <div>
                <EditableText contentKey="nosotros.cultura3.title" defaultValue="Caviar de café y aperitivos de autor" as="h4" />
                <EditableText
                  contentKey="nosotros.cultura3.body"
                  defaultValue="Experiencias gastronómicas alrededor del grano, con degustaciones únicas pensadas para sorprender."
                  as="p" multiline
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="espacio">
        <div className="wrap">
          <Reveal className="section-head">
            <EditableText contentKey="nosotros.espacio.eyebrow" defaultValue="El local" as="p" className="eyebrow" />
            <EditableText contentKey="nosotros.espacio.heading" defaultValue="Un vistazo por dentro." as="h2" />
            <EditableText contentKey="nosotros.espacio.sub" defaultValue="Desliza para ver más." as="p" />
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
    </SiteContentProvider>
  );
}
