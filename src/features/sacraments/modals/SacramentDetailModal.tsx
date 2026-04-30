import { FormModal } from '@/components/modals/FormModal';
import { SacramentDetails } from '../components/SacramentDetails';
import type { Sacrament } from '@/types';

interface SacramentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sacrament: Sacrament | null;
}

export function SacramentDetailModal({ open, onOpenChange, sacrament }: SacramentDetailModalProps) {
  if (!sacrament) return null;

  return (
    <FormModal open={open} onOpenChange={onOpenChange} title="Detalle del sacramento" size="md">
      <SacramentDetails sacrament={sacrament} />
    </FormModal>
  );
}