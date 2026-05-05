import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { MemberDetails } from '../components/MemberDetails';
import { EditMemberModal } from '../modals/EditMemberModal';
import { useMember } from '../hooks/useMember';
import { usePermissions } from '@/hooks/usePermissions';
import { useState } from 'react';

/**
 * Single member profile page.
 * Shows full details and allows editing based on permissions.
 */
export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [editOpen, setEditOpen] = useState(false);

  const { data: response, isLoading, isError, refetch } = useMember(id ?? '');

  const member = response?.data;

  if (isLoading) return <PageLoader />;
  if (isError || !member) {
    return (
      <ErrorState
        error="No se pudo cargar el perfil del miembro."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/members')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        {can('members:write') && (
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      <MemberDetails member={member} />

      <EditMemberModal
        open={editOpen}
        onOpenChange={setEditOpen}
        member={member}
      />
    </div>
  );
}