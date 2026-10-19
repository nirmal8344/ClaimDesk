import { request } from './api';
import { AdminDashboardData, CustomerDashboardData, OfficerDashboardData } from '../types';

export const dashboardService = {
  async getCustomerDashboard(): Promise<CustomerDashboardData> {
    return request<CustomerDashboardData>('/customer/dashboard');
  },

  async getOfficerDashboard(): Promise<OfficerDashboardData> {
    return request<OfficerDashboardData>('/officer/dashboard');
  },

  async getAdminDashboard(): Promise<AdminDashboardData> {
    return request<AdminDashboardData>('/admin/dashboard');
  }
};
