/**
 * @fileoverview Socket.IO hook for real-time updates.
 * In development, connects directly to the backend to avoid Vite proxy conflicts.
 * In production, connects to the same origin via relative path.
 */
import { useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

/** Build the Socket.IO URL depending on environment */
function getSocketUrl(): string {
  if (import.meta.env.DEV) {
    // Development: bypass Vite proxy, connect directly to backend
    return 'http://localhost:3000';
  }
  // Production: same origin, served by the backend itself
  return window.location.origin;
}

const EVENT_CACHE_MAP: Record<string, string[]> = {
  appointment: ['appointments', 'schedule'],
  sacrament: ['sacraments'],
  'pastoral-note': ['pastoral-notes'],
  user: ['users'],
  member: ['members'],
};

export function useSocket() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(false);

  // Stable cache invalidation callback (doesn't change on re-renders)
  const invalidate = useCallback(
    (keys: string[]) => {
      for (const key of keys) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
    [queryClient],
  );

  useEffect(() => {
    mountedRef.current = true;

    const socket = io(getSocketUrl(), {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.debug('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.debug('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      if (mountedRef.current) {
        console.warn('[Socket] Connection error:', err.message);
      }
    });

    // Subscribe to all domain events
    const cleanups: (() => void)[] = [];

    for (const [prefix, keys] of Object.entries(EVENT_CACHE_MAP)) {
      for (const action of ['created', 'updated', 'deleted']) {
        const event = `${prefix}:${action}`;
        const handler = (data: unknown) => {
          console.debug(`[Socket] ${event}`, data);
          invalidate(keys);
        };
        socket.on(event, handler);
        cleanups.push(() => socket.off(event, handler));
      }
    }

    return () => {
      mountedRef.current = false;
      // Remove all listeners before closing to prevent EPIPE
      for (const cleanup of cleanups) {
        cleanup();
      }
      socket.close();
      socketRef.current = null;
    };
  }, [invalidate]);

  return socketRef;
}