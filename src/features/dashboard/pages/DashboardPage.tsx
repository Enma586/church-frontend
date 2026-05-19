/**
 * @fileoverview Dashboard page with member stats, appointments, and accounting charts.
 */
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { reportsService } from "@/features/reports/services/reports.service";
import { journalEntryService } from "@/features/journal/services/journal-entry.service";
import type {
  ApiResponse,
  Member,
  Appointment,
  PastoralNote,
  PaginatedResponse,
  TrialBalanceResponse,
  CashBalanceResponse,
  JournalEntry,
} from "@/types";
import {
  Users,
  CalendarDays,
  ScrollText,
  CalendarClock,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Colours ─────────────────────────────────────────────────────────────
const GREEN = "#16a34a";
const GREEN_LIGHT = "#86efac";
const RED = "#dc2626";
const RED_LIGHT = "#fca5a5";
const COLORS_10 = [
  "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a",
  "#0891b2", "#ca8a04", "#4f46e5", "#be123c", "#15803d",
];

// ─── Data fetching hooks ─────────────────────────────────────────────────

function useStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const [membersRes, appointmentsRes, notesRes] = await Promise.all([
        api.get<ApiResponse<Member[]> & PaginatedResponse<Member>>("/members?limit=1"),
        api.get<ApiResponse<Appointment[]> & PaginatedResponse<Appointment>>("/appointments?status=Programada&limit=5"),
        api.get<ApiResponse<PastoralNote[]> & PaginatedResponse<PastoralNote>>("/pastoral-notes?limit=5"),
      ]);
      return {
        totalMembers: membersRes.data.pagination?.total ?? 0,
        pendingAppointments: appointmentsRes.data.data ?? [],
        pendingTotal: appointmentsRes.data.pagination?.total ?? 0,
        recentNotes: notesRes.data.data ?? [],
      };
    },
    staleTime: 60_000,
  });
}

function useAccountingSummary() {
  return useQuery({
    queryKey: ["dashboard", "accounting"],
    queryFn: async () => {
      const [balanceRes, trialRes, journalRes] = await Promise.all([
        reportsService.getCashBalance({}),
        reportsService.getTrialBalance({}),
        journalEntryService.getAll({ limit: 5 }),
      ]);
      return {
        balance: (balanceRes.data as CashBalanceResponse) ?? { totalIngresos: 0, totalEgresos: 0, saldoNeto: 0 },
        trial: (trialRes.data as TrialBalanceResponse) ?? { data: [], totals: { totalIngresos: 0, totalEgresos: 0, saldoNeto: 0 } },
        recentEntries: (journalRes.data as JournalEntry[]) ?? [],
      };
    },
    staleTime: 60_000,
  });
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="tabular-nums">
          {p.name}: L. {Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────

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

// ─── Main page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useStats();
  const { data: accounting, isLoading: accLoading } = useAccountingSummary();

  const balance = accounting?.balance;
  const trial = accounting?.trial;
  const recentEntries = accounting?.recentEntries ?? [];

  // ── Donut data ──
  const donutData = [
    { name: "Ingresos", value: balance?.totalIngresos ?? 0 },
    { name: "Egresos", value: balance?.totalEgresos ?? 0 },
  ];

  // ── Bar chart data (top 8 accounts by movement) ──
  const barData = (trial?.data ?? [])
    .filter((r) => r.totalIngresos > 0 || r.totalEgresos > 0)
    .map((r, i) => ({
      name: r.name.length > 18 ? r.name.slice(0, 16) + "…" : r.name,
      fullName: r.name,
      Ingresos: r.totalIngresos,
      Egresos: r.totalEgresos,
      fill: COLORS_10[i % COLORS_10.length],
    }))
    .sort((a, b) => b.Ingresos + b.Egresos - (a.Ingresos + a.Egresos))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* ── Stat cards row 1 ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Miembros" value={isLoading ? undefined : data?.totalMembers?.toLocaleString()} icon={Users} color="text-blue-600 bg-blue-100 dark:bg-blue-900/30" href="/members" />
        <StatCard title="Citas pendientes" value={isLoading ? undefined : data?.pendingTotal?.toLocaleString()} icon={CalendarDays} color="text-orange-600 bg-orange-100 dark:bg-orange-900/30" href="/appointments" />
        <StatCard title="Próx. eventos" value={isLoading ? undefined : data ? `${data.pendingTotal ?? 0} pendientes` : "0"} icon={CalendarClock} color="text-purple-600 bg-purple-100 dark:bg-purple-900/30" href="/schedule" />
        <StatCard title="Notas recientes" value={isLoading ? undefined : data?.recentNotes?.length?.toLocaleString()} icon={ScrollText} color="text-green-600 bg-green-100 dark:bg-green-900/30" href="/pastoral-notes" />
      </div>

      {/* ── Contabilidad ── */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Contabilidad</h2>

        {/* Accounting stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Ingresos</p>
                {accLoading ? <Skeleton className="h-7 w-24 mt-1" /> : (
                  <p className="text-xl font-bold text-green-600 tabular-nums">L. {(balance?.totalIngresos ?? 0).toFixed(2)}</p>
                )}
              </div>
              <div className="rounded-full bg-green-100 p-2"><TrendingUp className="h-5 w-5 text-green-600" /></div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Egresos</p>
                {accLoading ? <Skeleton className="h-7 w-24 mt-1" /> : (
                  <p className="text-xl font-bold text-red-600 tabular-nums">L. {(balance?.totalEgresos ?? 0).toFixed(2)}</p>
                )}
              </div>
              <div className="rounded-full bg-red-100 p-2"><TrendingDown className="h-5 w-5 text-red-600" /></div>
            </CardContent>
          </Card>
          <Card className={cn("border-l-4", (balance?.saldoNeto ?? 0) >= 0 ? "border-l-green-500" : "border-l-red-500")}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Saldo</p>
                {accLoading ? <Skeleton className="h-7 w-24 mt-1" /> : (
                  <p className={cn("text-xl font-bold tabular-nums", (balance?.saldoNeto ?? 0) >= 0 ? "text-green-600" : "text-red-600")}>
                    L. {(balance?.saldoNeto ?? 0).toFixed(2)}
                  </p>
                )}
              </div>
              <div className={cn("rounded-full p-2", (balance?.saldoNeto ?? 0) >= 0 ? "bg-green-100" : "bg-red-100")}>
                <Wallet className={cn("h-5 w-5", (balance?.saldoNeto ?? 0) >= 0 ? "text-green-600" : "text-red-600")} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* ── Donut: Ingresos vs Egresos ── */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ingresos vs Egresos</CardTitle>
            </CardHeader>
            <CardContent>
              {accLoading ? (
                <Skeleton className="h-52 w-full rounded-xl" />
              ) : donutData.every((d) => d.value === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-12">Sin movimientos aún</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={GREEN} />
                      <Cell fill={RED} />
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      formatter={(value: string) => (
                        <span className="text-sm">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* ── Bar chart: Ingresos vs Egresos por cuenta ── */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Movimiento por cuenta</CardTitle>
              <Link to="/reports"><Button variant="ghost" size="sm">Ver reportes</Button></Link>
            </CardHeader>
            <CardContent>
              {accLoading ? (
                <Skeleton className="h-52 w-full rounded-xl" />
              ) : barData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Sin movimientos contables.{" "}
                  <Link to="/journal" className="underline text-primary">Ir al libro diario</Link>
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `L.${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="rect" />
                    <Bar dataKey="Ingresos" fill={GREEN} radius={[0, 4, 4, 0]} barSize={14} />
                    <Bar dataKey="Egresos" fill={RED} radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Últimos asientos ── */}
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Últimos movimientos</CardTitle>
            <Link to="/journal"><Button variant="ghost" size="sm">Ver todos</Button></Link>
          </CardHeader>
          <CardContent>
            {accLoading ? (
              <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
            ) : recentEntries.length > 0 ? (
              <ul className="space-y-2">
                {recentEntries.map((e) => (
                  <li key={e._id} className="flex items-center justify-between text-sm border-b pb-1.5 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn("shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded", e.type === "Ingreso" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {e.type === "Ingreso" ? "+" : "−"}
                      </span>
                      <span className="truncate">{e.concept}</span>
                    </div>
                    <span className={cn("shrink-0 ml-2 tabular-nums text-sm font-medium", e.type === "Ingreso" ? "text-green-600" : "text-red-600")}>
                      L. {e.amount.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sin movimientos registrados.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Existing bottom cards ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Eventos pendientes</CardTitle>
            <Link to="/appointments"><Button variant="ghost" size="sm">Ver todas</Button></Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
            ) : data && data.pendingAppointments.length > 0 ? (
              <ul className="space-y-2">
                {data.pendingAppointments.map((a) => (
                  <li key={a._id} className="flex items-center justify-between text-sm border-b pb-1.5 last:border-0">
                    <span className="font-medium truncate">{a.title}</span>
                    <span className="text-muted-foreground text-xs ml-2 shrink-0">
                      {a.startDateTime ? new Date(a.startDateTime).toLocaleDateString("es-HN") : a.allDayDate ? new Date(a.allDayDate).toLocaleDateString("es-HN") : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No hay eventos pendientes.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Últimas notas</CardTitle>
            <Link to="/pastoral-notes"><Button variant="ghost" size="sm">Ver todas</Button></Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
            ) : data && data.recentNotes.length > 0 ? (
              <ul className="space-y-2">
                {data.recentNotes.map((note) => (
                  <li key={note._id} className="text-sm border-b pb-1.5 last:border-0">
                    <p className="line-clamp-2 text-muted-foreground">{note.content}</p>
                    <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString("es-HN", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No hay notas registradas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
