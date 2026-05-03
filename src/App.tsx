import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { store } from '@/store';
import { queryClient } from '@/lib/query-client';
import { router } from '@/routes';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SocketProvider } from '@/components/feedback/SocketProvider';

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SocketProvider />
          <RouterProvider router={router} />
          <ToastProvider />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}