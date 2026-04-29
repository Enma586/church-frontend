import api from '@/lib/axios';
import type { ApiResponse, Department, Municipality, PaginatedResponse } from '@/types';

interface DepartmentParams {
  search?: string;
  page?: number;
  limit?: number;
}

interface MunicipalityParams {
  departmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Service layer for geographical entities (departments & municipalities).
 * All calls require an active session (cookie JWT sent via withCredentials).
 */
export const addressService = {
  /**
   * Fetches a paginated, optionally searched list of departments.
   * Departments rarely change, so callers should use a long staleTime.
   */
  getDepartments: async (params: DepartmentParams = {}) => {
    const { data } = await api.get<ApiResponse<Department[]> & PaginatedResponse<Department>>(
      '/address/departments',
      { params },
    );
    return data;
  },

  /**
   * Fetches municipalities, optionally filtered by departmentId.
   * Returns up to 300 records (the whole country) when no departmentId is set.
   */
  getMunicipalities: async (params: MunicipalityParams = {}) => {
    const { data } = await api.get<ApiResponse<Municipality[]> & PaginatedResponse<Municipality>>(
      '/address/municipalities',
      { params },
    );
    return data;
  },
};