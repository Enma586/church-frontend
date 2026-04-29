import api from '@/lib/axios';
import type {
  ApiResponse,
  Member,
  CreateMemberPayload,
  UpdateMemberPayload,
  MemberQueryParams,
  PaginatedResponse,
} from '@/types';

/**
 * Service layer for member CRUD operations.
 * All endpoints require authentication (cookie JWT).
 * Create / Update / Delete additionally require the Coordinador role.
 */
export const memberService = {
  /**
   * Paginated list of members with optional filters.
   * @param params - Search, status, gender, departmentId, pagination.
   */
  getAll: async (params: MemberQueryParams = {}) => {
    const { data } = await api.get<ApiResponse<Member[]> & PaginatedResponse<Member>>(
      '/members',
      { params },
    );
    return data;
  },

  /**
   * Single member by MongoDB ObjectId.
   * Returns populated department and municipality names.
   */
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Member>>(`/members/${id}`);
    return data;
  },

  /**
   * Registers a new member in the system.
   * Requires Coordinador role.
   */
  create: async (payload: CreateMemberPayload) => {
    const { data } = await api.post<ApiResponse<Member>>('/members', payload);
    return data;
  },

  /**
   * Updates an existing member's information.
   * Requires Coordinador role.
   */
  update: async (id: string, payload: UpdateMemberPayload) => {
    const { data } = await api.put<ApiResponse<Member>>(`/members/${id}`, payload);
    return data;
  },

  /**
   * Permanently deletes a member record.
   * Requires Coordinador role.
   */
  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<void>>(`/members/${id}`);
    return data;
  },
};