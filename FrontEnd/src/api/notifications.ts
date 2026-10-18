import { api } from './client';
import { NotificationItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const notificationsApi = {
  getNotifications: (page: number = 0, size: number = 30) =>
    api.get<NotificationItem[]>(`/me/notifications?page=${page}&size=${size}`),

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get<{ count: number } | number>('/me/notifications/unread-count');
    if (res && typeof res === 'object' && 'count' in res) return (res as { count: number }).count;
    return typeof res === 'number' ? res : 0;
  },

  markAsRead: (id: string | number) =>
    api.patch<NotificationItem>(`/me/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch<void>('/me/notifications/read-all'),

  getStreamUrl: (token: string) =>
    `${API_BASE_URL}/me/notifications/stream?token=${encodeURIComponent(token)}`,
};
