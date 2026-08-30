'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const TAGS = { div: motion.div, section: motion.section, article: motion.article };

export default function Reveal({ as = 'div', delay = 0, className = '', style, children, ...rest }) {
  const MotionTag = TAGS[as] || motion.div;
  const ref = useRef(null);
  // Empieza visible: así el primer render (incluido el HTML del servidor) nunca
  // muestra contenido invisible por un instante si ya está dentro de la pantalla.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;

    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyInView) return undefined; // ya visible, no hay nada que animar

    setVisible(false); // está más abajo: se oculta hasta que aparezca en pantalla
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { setVisible(true); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <MotionTag
      ref={ref}
      className={className}
      style={style}
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 0.61, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
