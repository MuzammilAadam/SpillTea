import { useEffect, useRef } from 'react';
import { NotificationItem } from '../types';

interface Options { token: string | null; isAuthenticated: boolean; onNewNotification: (notification: NotificationItem) => void; onUnreadCountUpdate?: (count: number) => void; }

/** JWT-authenticated SSE without putting a long-lived token in the URL. */
export function useNotificationStream({ token, isAuthenticated, onNewNotification, onUnreadCountUpdate }: Options) {
  const abortRef = useRef<AbortController | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let stopped = false; let attempts = 0;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const connect = async () => {
      if (stopped) return;
      const controller = new AbortController(); abortRef.current = controller;
      try {
        const response = await fetch(`${base}/me/notifications/stream`, { headers: { Accept: 'text/event-stream', Authorization: `Bearer ${token}` }, signal: controller.signal });
        if (!response.ok || !response.body) throw new Error(`Notification stream failed (${response.status})`);
        attempts = 0; const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''; let eventName = 'message';
        while (!stopped) {
          const { done, value } = await reader.read(); if (done) break;
          buffer += decoder.decode(value, { stream: true }); const events = buffer.split(/\r?\n\r?\n/); buffer = events.pop() || '';
          for (const raw of events) {
            let data = ''; for (const line of raw.split(/\r?\n/)) { if (line.startsWith('event:')) eventName = line.slice(6).trim(); if (line.startsWith('data:')) data += line.slice(5).trim(); }
            if (!data) continue;
            try { const parsed = JSON.parse(data); if (eventName === 'connected' && typeof parsed.unreadCount === 'number') onUnreadCountUpdate?.(parsed.unreadCount); if (eventName === 'notification') onNewNotification(parsed as NotificationItem); } catch { /* ignore malformed event */ }
            eventName = 'message';
          }
        }
      } catch (error) { if (!stopped && (error as Error).name !== 'AbortError') { retryRef.current = setTimeout(connect, Math.min(1000 * 2 ** attempts++, 30000)); } }
    };
    connect();
    return () => { stopped = true; if (retryRef.current) clearTimeout(retryRef.current); abortRef.current?.abort(); abortRef.current = null; };
  }, [isAuthenticated, token, onNewNotification, onUnreadCountUpdate]);
}
