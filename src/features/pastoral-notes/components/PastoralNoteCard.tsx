import { ScrollText, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PastoralNote } from '@/types';

interface Props { note: PastoralNote; onClick?: () => void; }

export function PastoralNoteCard({ note, onClick }: Props) {
  const memberName = typeof note.memberId === 'object' ? note.memberId.fullName : '—';
  const authorName = typeof note.authorId === 'object' ? note.authorId.username : '—';

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onClick}>
      <CardContent className="flex items-start gap-3 p-4">
        {note.isSensitive ? (
          <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        ) : (
          <ScrollText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {note.content}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {memberName} — @{authorName}
            {' · '}{format(new Date(note.createdAt), 'dd/MM/yy', { locale: es })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}