import { Toaster } from 'sonner';
import { useAppSelector } from '@/store/hooks';
import { toastConfig } from '@/lib/toast.config';

export function ToastProvider() {
  const mode = useAppSelector((s) => s.theme.mode);

  return <Toaster {...toastConfig} theme={mode} />;
}