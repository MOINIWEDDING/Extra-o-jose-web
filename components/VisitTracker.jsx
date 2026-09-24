'use client';
import { useEffect } from 'react';
import { useBranch } from '@/context/BranchContext';
import { trackVisit } from '@/lib/analytics';

export default function VisitTracker() {
  const { branch, ready } = useBranch();

  useEffect(() => {
    // esperamos a que ya haya una sucursal elegida — si registramos la visita
    // antes, queda sin sucursal y nunca aparece al filtrar por una en Estadísticas.
    if (!ready || !branch) return;
    trackVisit(branch);
  }, [ready, branch]);

  return null;
}
