import type { User, LoginPayload } from '@/types';

export type { User, LoginPayload };

export interface RegisterPayload {
  fullName: string;
  email?: string;
  username: string;
  password: string;
}