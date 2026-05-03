/**
 * @fileoverview Card component displaying a role summary with permissions count.
 * Used in the roles list to preview each role (Coordinador / Subcoordinador).
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck } from 'lucide-react';
import type { RoleData } from '../types/role.types';

interface RoleCardProps {
  role: RoleData;
  onClick?: () => void;
}

export function RoleCard({ role, onClick }: RoleCardProps) {
  const isCoordinator = role.role === 'Coordinador';

  return (
    <Card
      className={`cursor-pointer transition-shadow hover:shadow-md ${
        isCoordinator
          ? 'border-primary/30'
          : 'border-muted'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCoordinator ? (
              <ShieldCheck className="h-5 w-5 text-primary" />
            ) : (
              <Shield className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle className="text-lg">{role.role}</CardTitle>
          </div>
          <Badge variant={isCoordinator ? 'default' : 'secondary'}>
            {role.permissions.length} permisos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {isCoordinator
            ? 'Acceso completo al sistema. Puede gestionar usuarios, configuración y todos los módulos.'
            : 'Acceso operativo. Gestiona miembros, citas, sacramentos y notas.'}
        </p>
      </CardContent>
    </Card>
  );
}