/**
 * Centralized configuration for Sonner toast notifications.
 *
 * Usage:
 * import { toast } from 'sonner'
 * toast.success('Member created successfully')
 * toast.error('Error creating member')
 *
 * The <Toaster /> component is mounted in App.tsx (Phase 9).
 */

export const toastConfig = {
  // Screen position for the notification stack
  position: 'top-right' as const,
  
  // Time in milliseconds before the toast disappears
  duration: 4000,
  
  // Maximum number of toasts visible on screen simultaneously
  visibleToasts: 5,
  
  // Show a close button (X) on each toast
  closeButton: true,
  
  // Use semantic colors (green for success, red for error, etc.)
  richColors: true,
};