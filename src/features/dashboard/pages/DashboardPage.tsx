/**
 * @fileoverview Dashboard page — landing view after login.
 * Shows quick stats: member count, pending appointments,
 * upcoming schedule events, and recent pastoral notes.
 */
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type {
  ApiResponse,
  Member,
  Appointment,
  PastoralNote,
  PaginatedResponse,
} from '@/types';
import {
  Users,
  CalendarDays,
  ScrollText,
  CalendarClock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/** Fetch total members count */
function useStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const [membersRes, appointmentsRes, notesRes] = await Promise.all([
        api.get<ApiResponse<Member[]> & PaginatedResponse<Member>>(
          '/members?limit=1',
        ),
        api.get<
          ApiResponse<Appointment[]> & PaginatedResponse<Appointment>
        >('/appointments?status=Programada&limit=5'),
        api.get<
          ApiResponse<PastoralNote[]> & PaginatedResponse<PastoralNote>
        >('/pastoral-notes?limit=5'),
      ]);

      return {
        totalMembers: membersRes.data.pagination?.total ?? 0,
        pendingAppointments: appointmentsRes.data.data ?? [],
        pendingTotal: appointmentsRes.data.pagination?.total ?? 0,
        recentNotes: notesRes.data.data ?? [],
      };
    },
    staleTime: 60_000, // 1 min
  });
}

export default function DashboardPage() {
  const { data, isLoading } = useStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Miembros"
          value={
            isLoading ? undefined : data?.totalMembers?.toLocaleString()
          }
          icon={Users}
          color="text-blue-600 bg-blue-100 dark:bg-blue-900/30"
          href="/members"
        />
        <StatCard
          title="Citas pendientes"
          value={
            isLoading ? undefined : data?.pendingTotal?.toLocaleString()
          }
          icon={CalendarDays}
          color="text-orange-600 bg-orange-100 dark:bg-orange-900/30"
          href="/appointments"
        />
        <StatCard
          title="Próx. eventos"
          value={
            isLoading
              ? undefined
              : data
                ? `${data.pendingTotal ?? 0} pendientes`
                : '0'
          }
          icon={CalendarClock}
          color="text-purple-600 bg-purple-100 dark:bg-purple-900/30"
          href="/schedule"
        />
        <StatCard
          title="Notas recientes"
          value={
            isLoading
              ? undefined
              : data?.recentNotes?.length?.toLocaleString()
          }
          icon={ScrollText}
          color="text-green-600 bg-green-100 dark:bg-green-900/30"
          href="/pastoral-notes"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Citas pendientes ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">
              Eventos pendientes
            </CardTitle>
            <Link to="/appointments">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : data && data.pendingAppointments.length > 0 ? (
              <ul className="space-y-2">
                {data.pendingAppointments.map((a) => (
                  <li
                    key={a._id}
                    className="flex items-center justify-between text-sm border-b pb-1.5 last:border-0"
                  >
                    <span className="font-medium truncate">
                      {a.title}
                    </span>
                    <span className="text-muted-foreground text-xs ml-2 shrink-0">
                      {a.startDateTime
                        ? new Date(a.startDateTime).toLocaleDateString(
                            'es-HN',
                          )
                        : a.allDayDate
                          ? new Date(a.allDayDate).toLocaleDateString(
                              'es-HN',
                            )
                          : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay eventos pendientes.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Últimas notas pastorales ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">
              Últimas notas
            </CardTitle>
            <Link to="/pastoral-notes">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : data && data.recentNotes.length > 0 ? (
              <ul className="space-y-2">
                {data.recentNotes.map((note) => (
                  <li
                    key={note._id}
                    className="text-sm border-b pb-1.5 last:border-0"
                  >
                    <p className="line-clamp-2 text-muted-foreground">
                      {note.content}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString(
                        'es-HN',
                        {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        },
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay notas registradas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Reusable stat card with icon, value, and link */
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
}) {
  return (
    <Link to={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="flex items-center gap-4 p-4">
          <div className={`rounded-lg p-2.5 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            {value !== undefined ? (
              <p className="text-2xl font-bold">{value}</p>
            ) : (
              <Skeleton className="h-7 w-12 mt-1" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}