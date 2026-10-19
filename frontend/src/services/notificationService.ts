import { request } from './api';
import { NotificationItem, PageResponse } from '../types';

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/notifications');
  },

  async getNotificationsPaged(page: number = 0, size: number = 10): Promise<PageResponse<NotificationItem>> {
    return request<PageResponse<NotificationItem>>('/notifications/paged', { params: { page, size } });
  },

  async getUnreadCount(): Promise<number> {
    const res = await request<{ unreadCount: number }>('/notifications/unread-count');
    return res.unreadCount;
  },

  async markAsRead(id: number): Promise<void> {
    return request<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead(): Promise<void> {
    return request<void>('/notifications/read-all', {
      method: 'PUT',
    });
  }
};
