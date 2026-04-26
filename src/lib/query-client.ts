import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query client configuration.
 * Defines the default behavior for all queries and mutations across the application.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes; prevents unnecessary background refetching
      staleTime: 5 * 60 * 1000, 
      
      // Data remains in memory for 10 minutes after becoming inactive (formerly cacheTime)
      gcTime: 10 * 60 * 1000,    
      
      // Failed queries will only attempt 1 automatic retry
      retry: 1,                          
      
      // Disables automatic refetching when the user switches back to the browser tab
      refetchOnWindowFocus: false,       
    },
    mutations: {
      // Mutations (POST/PUT/DELETE) will not retry automatically on failure to avoid side effects
      retry: 0,                          
    },
  },
});