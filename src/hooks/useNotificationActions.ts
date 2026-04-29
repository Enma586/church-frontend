import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addNotification } from '@/store/slices/notificationSlice';

/**
 * Shorthand helpers to dispatch in-app (bell‑icon) notifications
 * after successful CRUD operations.
 *
 * @example
 * const { notifyCreated } = useNotificationActions();
 * notifyCreated('Member', 'Juan Pérez');
 */
export function useNotificationActions() {
  const dispatch = useAppDispatch();

  const notify = useCallback(
    (type: string, entity: string, name?: string) => {
      dispatch(
        addNotification({
          type,
          message: name
            ? `${entity} "${name}" ${type.endsWith(':deleted') ? 'eliminado' : type.endsWith(':created') ? 'creado' : 'actualizado'} exitosamente`
            : `${entity} ${type.endsWith(':deleted') ? 'eliminado' : type.endsWith(':created') ? 'creado' : 'actualizado'} exitosamente`,
        }),
      );
    },
    [dispatch],
  );

  const notifyCreated = useCallback(
    (entity: string, name?: string) => notify(`${entity.toLowerCase()}:created`, entity, name),
    [notify],
  );

  const notifyUpdated = useCallback(
    (entity: string, name?: string) => notify(`${entity.toLowerCase()}:updated`, entity, name),
    [notify],
  );

  const notifyDeleted = useCallback(
    (entity: string, name?: string) => notify(`${entity.toLowerCase()}:deleted`, entity, name),
    [notify],
  );

  return { notifyCreated, notifyUpdated, notifyDeleted };
}