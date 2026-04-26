export const SYNC_STATUSES = ['synced', 'pending_sync', 'failed', 'orphan'] as const;

export type SyncStatus = (typeof SYNC_STATUSES)[number];

/** Etiquetas en español para mostrar en badges */
export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  synced: 'Sincronizada',
  pending_sync: 'Pendiente',
  failed: 'Fallida',
  orphan: 'Huérfana',
};