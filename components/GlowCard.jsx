'use client';
import { useRef } from 'react';

export default function GlowCard({ children, hue = 30, onClick, className = '' }) {
  const ref = useRef(null);

  function onPointerMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--y', `${e.clientY - rect.top}px`);
  }

  return (
    <button
      type="button"
      ref={ref}
      className={`glow-card ${className}`}
      style={{ '--hue': hue }}
      onClick={onClick}
      onPointerMove={onPointerMove}
    >
      <span className="glow-card-spot" aria-hidden="true" />
      <span className="glow-card-border" aria-hidden="true" />
      <div className="glow-card-content">{children}</div>
    </button>
  );
}
