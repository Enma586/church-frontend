import { useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/notificationSlice';

function getSocketUrl(): string {
  if (import.meta.env.DEV) return 'http://localhost:3000';
  return window.location.origin;
}

/** Cache keys to invalidate per domain */
const EVENT_CACHE_MAP: Record<string, string[]> = {
  appointment:    ['appointments', 'schedule', 'dashboard'],
  sacrament:      ['sacraments', 'dashboard'],
  'pastoral-note': ['pastoral-notes', 'dashboard'],
  user:           ['users', 'dashboard'],
  member:         ['members', 'dashboard'],
};

/** Human-readable entity names for notifications */
const ENTITY_LABELS: Record<string, string> = {
  appointment: 'Cita',
  sacrament: 'Sacramento',
  'pastoral-note': 'Nota pastoral',
  user: 'Usuario',
  member: 'Miembro',
};

/** Action labels in Spanish */
const ACTION_LABELS: Record<string, string> = {
  created: 'creado/a',
  updated: 'actualizado/a',
  deleted: 'eliminado/a',
};

export function useSocket() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(false);

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

    const cleanups: (() => void)[] = [];

    for (const [prefix, keys] of Object.entries(EVENT_CACHE_MAP)) {
      const entity = ENTITY_LABELS[prefix] ?? prefix;

      for (const action of ['created', 'updated', 'deleted']) {
        const event = `${prefix}:${action}`;
        const actionLabel = ACTION_LABELS[action] ?? action;

        const handler = (data: unknown) => {
          // Invalidate TanStack Query cache
          invalidate(keys);

          // Dispatch Redux notification (bell icon)
          const payload = data as Record<string, unknown> | undefined;
          const name = payload?.title ?? payload?.name ?? payload?.fullName ?? '';
          const message = name
            ? `${entity} "${String(name).slice(0, 50)}" ${actionLabel}`
            : `${entity} ${actionLabel}`;

          dispatch(
            addNotification({
              type: event,
              message,
            }),
          );
        };

        socket.on(event, handler);
        cleanups.push(() => socket.off(event, handler));
      }
    }

    return () => {
      mountedRef.current = false;
      for (const cleanup of cleanups) cleanup();
      socket.close();
      socketRef.current = null;
    };
  }, [invalidate, dispatch]);

  return socketRef;
}