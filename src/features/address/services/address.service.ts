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

export const addressService = {
  getDepartments: async (params: DepartmentParams = {}) => {
    const { data } = await api.get<ApiResponse<Department[]> & PaginatedResponse<Department>>(
      '/address/departments',
      { params },
    );
    return data;
  },

  getMunicipalities: async (params: MunicipalityParams = {}) => {
    const { data } = await api.get<ApiResponse<Municipality[]> & PaginatedResponse<Municipality>>(
      '/address/municipalities',
      { params },
    );
    return data;
  },
};