import { LoadingSpinner } from './LoadingSpinner';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Cargando...' }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}