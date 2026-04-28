import axios from 'axios';
import type { ApiResponse } from '@/types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ─── Log estructurado para debug ──────────────────────────────────
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const backendMessage = error.response?.data?.message;
    const backendErrors = error.response?.data?.errors;

    console.error(
      `[API] ${method} ${url} → ${status}`,
      {
        status,
        url,
        method,
        message: backendMessage ?? error.message,
        errors: backendErrors ?? null,
        timestamp: new Date().toISOString(),
      },
    );

    // ─── Redirigir al login si 401 ────────────────────────────────────
    if (status === 401) {
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

/**
 * Extrae el mensaje de error del backend sin importar si viene de:
 * - axios error.response.data.message
 * - axios error.response.data.errors[]
 * - Error nativo (error.message)
 */
export function getErrorMessage(error: unknown, fallback = 'Error de conexión'): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (error as { response?: { data?: { message?: string; errors?: string[] } } }).response;
    if (res?.data?.message) return res.data.message;
    if (res?.data?.errors?.length) return res.data.errors.join(', ');
  }
  if (error instanceof Error) return error.message;
  return fallback;
}