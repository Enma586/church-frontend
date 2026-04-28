import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { queryClient } from './lib/query-client';
import { router } from './routes';
import { Toaster } from 'sonner';

// 1. Importamos el proveedor de tooltips de tu carpeta UI
import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {/* 2. Envolvemos el Router y el Toaster con el TooltipProvider */}
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;