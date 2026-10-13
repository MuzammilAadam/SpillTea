import { api } from './client';
import { NotificationItem } from '../types';

export const notificationsApi = {
  getNotifications: () =>
    api.get<NotificationItem[]>('/me/notifications'),

  getUnreadCount: () =>
    api.get<number>('/me/notifications/unread-count'),

  markAsRead: (id: string | number) =>
    api.put<void>(`/me/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put<void>('/me/notifications/read-all'),
};
