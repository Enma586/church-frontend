interface UserAuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function UserAuthLayout({ title, subtitle, children }: UserAuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* ─── Panel izquierdo: branding ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-primary/10 via-primary/5 to-background">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          {/* ═══ REEMPLAZAR por tu imagen ═══ */}
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20">
            <svg
              className="h-10 w-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 3l-7 5v8l7 5 7-5V8l-7-5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Iglesia Young</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
            Sistema de gestión pastoral para la comunidad
          </p>
        </div>
      </div>

      {/* ─── Panel derecho: formulario ──────────────────────────── */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}