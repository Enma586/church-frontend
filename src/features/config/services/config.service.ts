/**
 * @fileoverview Service layer for system configuration API calls.
 * The Configuration resource is a singleton — one document per installation.
 */
import api from '@/lib/axios';
import type {
  ApiResponse,
  Configuration,
  UpdateConfigurationPayload,
} from '@/types';

export const configService = {
  /** Fetch the current system configuration (singleton) */
  get: async (): Promise<ApiResponse<Configuration>> => {
    const { data } = await api.get<ApiResponse<Configuration>>('/config');
    return data;
  },

  /**
   * Update the system configuration.
   * Performs an upsert — creates the document if it doesn't exist.
   */
  update: async (
    payload: UpdateConfigurationPayload & Record<string, unknown>,
  ): Promise<ApiResponse<Configuration>> => {
    const { data } = await api.put<ApiResponse<Configuration>>(
      '/config',
      payload,
    );
    return data;
  },
};