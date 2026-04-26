import axios from 'axios';
import type { ApiResponse } from '@/types';

/**
 * Axios instance pre-configured for the application API.
 * Includes base URL, credential handling, and default headers.
 */
const api = axios.create({
  baseURL: '/api',
  // Automatically includes JWT cookies in cross-origin requests
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json' 
  },
});

// ─── Response Interceptor ──────────────────────────────────────────────────
/**
 * Global response interceptor to handle authentication errors.
 * If the backend returns a 401 Unauthorized status, the user is redirected to login.
 * Note: Integration with Redux state will be implemented in Phase 2.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is due to an expired or invalid token (401 Unauthorized)
    if (error.response?.status === 401) {
      /* * Phase 5 TODO: Trigger Redux logout action and handle state cleanup.
       * For now, we perform a hard redirect to prevent infinite loops 
       * and clear local session references.
       */
      const isLoginPage = window.location.pathname === '/login';
      
      if (!isLoginPage) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  },
);

export default api;
export type { ApiResponse };