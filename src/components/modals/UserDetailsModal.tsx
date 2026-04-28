import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { User } from '@/types';

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserDetailsModal({ open, onOpenChange, user }: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Usuario</span>
            <span className="text-sm">@{user.username}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rol</span>
            <Badge variant={user.role === 'Coordinador' ? 'default' : 'secondary'}>
              {user.role}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estado</span>
            <Badge variant={user.isActive ? 'default' : 'destructive'}>
              {user.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Creado</span>
            <span className="text-sm text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString('es-HN')}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}