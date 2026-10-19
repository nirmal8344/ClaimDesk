import { request } from './api';
import { PageResponse, Policy } from '../types';

export const policyService = {
  async getCustomerPolicies(status?: string): Promise<Policy[]> {
    return request<Policy[]>('/customer/policies', { params: { status } });
  },


  async getAllPoliciesAdmin(params?: { status?: string; search?: string; page?: number; size?: number }): Promise<PageResponse<Policy>> {
    return request<PageResponse<Policy>>('/admin/policies', { params });
  },

  async createPolicyAdmin(data: any): Promise<Policy> {
    return request<Policy>('/admin/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePolicyStatus(id: number, status: string): Promise<Policy> {
    return request<Policy>(`/admin/policies/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
};
