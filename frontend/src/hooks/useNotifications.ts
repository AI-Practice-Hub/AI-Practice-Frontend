"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Notification } from '@/types/notification';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      // Optimistically update the UI
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'read' as const }
            : notif
        )
      );

      // Call the API to mark as read
      await api.put(`/notifications/${notificationId}/read`);
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
      // Revert the optimistic update on error
      await fetchNotifications();
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
  };
}
