import { request, setAuthToken, removeAuthToken } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    localStorage.setItem('claimdesk_user', JSON.stringify(res));
    return res;
  },

  async register(data: { fullName: string; email: string; password: string; phoneNumber?: string; address?: string }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);
    localStorage.setItem('claimdesk_user', JSON.stringify(res));
    return res;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  async updateProfile(data: { fullName?: string; phoneNumber?: string; address?: string; department?: string }): Promise<User> {
    return request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(data: { currentPassword: string; newPassword: string; confirmNewPassword: string }): Promise<void> {
    return request<void>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout(): void {
    removeAuthToken();
  },

  getStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem('claimdesk_user');
    return stored ? JSON.parse(stored) : null;
  }
};
