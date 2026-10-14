import { useEffect, useRef, useCallback } from 'react';
import { NotificationItem } from '../types';

interface UseNotificationStreamOptions {
  token: string | null;
  isAuthenticated: boolean;
  onNewNotification: (notif: NotificationItem) => void;
  onUnreadCountUpdate?: (count: number) => void;
}

/**
 * Real-time SSE notification stream hook.
 * Connects to /api/me/notifications/stream when authenticated
 * and pushes live notifications as they arrive.
 */
export function useNotificationStream({
  token,
  isAuthenticated,
  onNewNotification,
  onUnreadCountUpdate,
}: UseNotificationStreamOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) return;

    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    // Append token as query param since EventSource doesn't support custom headers
    const streamUrl = `${API_BASE_URL}/me/notifications/stream?token=${encodeURIComponent(token)}`;

    try {
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.addEventListener('connected', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.unreadCount !== undefined && onUnreadCountUpdate) {
            onUnreadCountUpdate(data.unreadCount);
          }
          reconnectAttemptsRef.current = 0; // Reset on success
        } catch {
          // ignore parse errors
        }
      });

      es.addEventListener('notification', (e: MessageEvent) => {
        try {
          const notif: NotificationItem = JSON.parse(e.data);
          onNewNotification(notif);
        } catch {
          // ignore
        }
      });

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;

        // Exponential backoff reconnect
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000);
          reconnectAttemptsRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (err) {
      console.warn('SSE connection failed:', err);
    }
  }, [isAuthenticated, token, onNewNotification, onUnreadCountUpdate]);

  useEffect(() => {
    if (isAuthenticated && token) {
      reconnectAttemptsRef.current = 0;
      connect();
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isAuthenticated, token, connect]);
}
