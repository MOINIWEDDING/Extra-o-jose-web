'use client';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useBranch } from '@/context/BranchContext';
import BranchGate from './BranchGate';

export default function BranchGateWrapper() {
  const { profile } = useAuth();
  const { branch, ready } = useBranch();

  if (!ready) return null;
  const show = !!profile && !branch;

  return (
    <AnimatePresence>
      {show && <BranchGate />}
    </AnimatePresence>
  );
}
