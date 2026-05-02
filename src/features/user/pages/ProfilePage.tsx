import { User, Mail, Phone, Calendar, Shield, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Datos no disponibles.</p>
      </div>
    );
  }

  const member = typeof user.memberId === 'object' ? user.memberId : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mi perfil</h1>

      {/* ── Account card ──────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">@{user.username}</h2>
              <p className="text-sm text-muted-foreground">{user.role}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Detail icon={Shield} label="Rol">
              <Badge variant={user.role === 'Coordinador' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </Detail>

            <Detail icon={BadgeCheck} label="Estado">
              <Badge variant={user.isActive ? 'default' : 'destructive'}>
                {user.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </Detail>

            <Detail icon={Calendar} label="Miembro desde">
              {format(new Date(user.createdAt), 'PPP', { locale: es })}
            </Detail>
          </div>
        </CardContent>
      </Card>

      {/* ── Linked member card ────────────────────────────────────── */}
      {member && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Asociado al miembro
            </h3>

            <div className="space-y-2">
              <Detail icon={User} label="Nombre">
                {member.fullName}
              </Detail>

              {member.phone && (
                <Detail icon={Phone} label="Telefono">
                  {member.phone}
                </Detail>
              )}

              {member.email && (
                <Detail icon={Mail} label="Correo">
                  {member.email}
                </Detail>
              )}
            </div>

            <Separator />

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/members/${member._id}`)}
            >
              Ver perfil completo del miembro
            </Button>
          </CardContent>
        </Card>
      )}

      {!member && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-8">
            <User className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No hay miembros asociados a esta cuenta.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span>{children}</span>
    </div>
  );
}