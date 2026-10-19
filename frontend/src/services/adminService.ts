import { request } from './api';
import { PageResponse, SystemSetting, User } from '../types';

export const adminService = {
  async getCustomers(params?: { search?: string; page?: number; size?: number }): Promise<PageResponse<User>> {
    return request<PageResponse<User>>('/admin/customers', { params });
  },

  async updateCustomerStatus(id: number, status: string): Promise<User> {
    return request<User>(`/admin/customers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async getOfficers(params?: { search?: string; page?: number; size?: number }): Promise<PageResponse<User>> {
    return request<PageResponse<User>>('/admin/officers', { params });
  },

  async createOfficer(data: { fullName: string; email: string; phoneNumber?: string; department?: string; employeeId?: string; initialPassword: string }): Promise<User> {
    return request<User>('/admin/officers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOfficerStatus(id: number, status: string): Promise<User> {
    return request<User>(`/admin/officers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async getSettings(): Promise<SystemSetting[]> {
    return request<SystemSetting[]>('/settings');
  },

  async updateSetting(key: string, value: string, category?: string): Promise<SystemSetting> {
    return request<SystemSetting>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value, category }),
    });
  },

  async getCategories(): Promise<any[]> {
    return request<any[]>('/categories');
  },

  async addCategory(data: { name: string; description?: string; status?: string }): Promise<any> {
    return request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async exportReport(format: 'csv' | 'excel', type: string = 'claims'): Promise<Blob> {
    const endpoint = `/reports/export/${format}?type=${encodeURIComponent(type)}`;
    return request<Blob>(endpoint);
  }
};
