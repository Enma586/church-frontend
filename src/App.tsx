import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { store } from '@/store';
import { queryClient } from '@/lib/query-client';
import { router } from '@/routes';
import { ToastProvider } from '@/components/feedback/ToastProvider';

// 1. Importamos el proveedor de tooltips de shadcn
import { TooltipProvider } from '@/components/ui/tooltip';

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {/* 2. Envolvemos el Router y el Toast con el TooltipProvider */}
        <TooltipProvider>
          <RouterProvider router={router} />
          <ToastProvider /> 
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}