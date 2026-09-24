'use client';
import { useEffect } from 'react';
import { useBranch } from '@/context/BranchContext';
import { trackVisit } from '@/lib/analytics';

export default function VisitTracker() {
  const { branch, ready } = useBranch();

  useEffect(() => {
    if (!ready) return;
    trackVisit(branch);
  }, [ready, branch]);

  return null;
}
