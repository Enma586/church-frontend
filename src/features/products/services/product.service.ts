import api from '@/lib/axios';
import type {
  ApiResponse,
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductQueryParams,
  PaginatedResponse,
} from '@/types';

const BASE = '/accounting/products';

export const productService = {
  getAll: async (params: ProductQueryParams = {}) => {
    const { data } = await api.get<
      ApiResponse<Product[]> & PaginatedResponse<Product>
    >(BASE, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Product>>(`${BASE}/${id}`);
    return data;
  },

  create: async (payload: CreateProductPayload) => {
    const { data } = await api.post<ApiResponse<Product>>(BASE, payload);
    return data;
  },

  update: async (id: string, payload: UpdateProductPayload) => {
    const { data } = await api.put<ApiResponse<Product>>(`${BASE}/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<void>>(`${BASE}/${id}`);
    return data;
  },
};