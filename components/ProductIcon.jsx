'use client';

const PATHS = {
  v60: <><path d="M14 10h20l-8 16v10a2 2 0 0 1-4 0V26z" /><path d="M10 10h28" /></>,
  chemex: <><path d="M18 6h12l3 14-3 4v14a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2V24l-3-4z" /><path d="M16 22h16" /></>,
  espresso: <><path d="M12 20h20v10a10 10 0 0 1-20 0z" /><path d="M32 22h4a4 4 0 0 1 0 8h-4" /></>,
  flatwhite: <><path d="M10 18h22v10a11 11 0 0 1-22 0z" /><path d="M32 20h4a4 4 0 0 1 0 8h-4" /></>,
  coldbrew: <><path d="M14 10h20l-2 26a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2z" /><path d="M12 10h24" /></>,
  toast: <><rect x="9" y="14" width="30" height="20" rx="3" /><path d="M14 22c4-3 6 2 9-1s6 2 9-1s4 1 4 1" opacity=".8" /></>,
  sandwich: <><path d="M6 30 24 8l18 22z" /><path d="M10 26h28M12 22h24" opacity=".7" /></>,
  cupping: <><ellipse cx="16" cy="30" rx="8" ry="6" /><ellipse cx="34" cy="26" rx="7" ry="5.5" /></>,
  star: <><path d="M24 6l5.5 12L42 20l-9.5 8.5L35 41l-11-6.5L13 41l2.5-12.5L6 20l12.5-2z" /></>,
  coffee: <><path d="M11 18h22v10a11 11 0 0 1-22 0z" /><path d="M33 20h4a4 4 0 0 1 0 8h-4" /></>,
};

export default function ProductIcon({ name = 'coffee', ...rest }) {
  return (
    <svg viewBox="0 0 48 48" {...rest}>
      {PATHS[name] || PATHS.coffee}
    </svg>
  );
}

export const ICON_KEYS = Object.keys(PATHS);
