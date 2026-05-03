/**
 * @fileoverview Invisible wrapper that activates the useSocket hook.
 * Renders nothing — its only purpose is to bootstrap the Socket.IO
 * connection at the app root so all pages benefit from live updates.
 */
import { useSocket } from '@/hooks/useSocket';

export function SocketProvider() {
  useSocket();
  return null;
}