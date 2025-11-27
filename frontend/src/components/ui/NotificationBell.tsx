"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';

interface NotificationBellProps {
  className?: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { notifications, unreadCount, loading, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (notification.status === 'unread') {
      await markAsRead(notification.id);
    }

    // Close dropdown
    setIsOpen(false);

    // Navigate to test cases page
    router.push(`/dashboard/projects/${notification.project_id}/test-cases?chatId=${notification.chat_id}`);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Fixed Header */}
        <div className="p-4 border-b border-border bg-background sticky top-0 z-10">
          <h3 className="font-semibold text-sm flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {unreadCount} new
              </span>
            )}
          </h3>
        </div>
        
        {/* Scrollable Content */}
        <div className="max-h-96 overflow-y-auto p-4 custom-scrollbar">
          {loading && notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 rounded-lg transition-colors cursor-pointer ${
                    notification.status === 'unread' 
                      ? 'bg-primary/10 hover:bg-primary/20' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {notification.status === 'unread' && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm text-foreground ${
                        notification.status === 'unread' ? 'font-semibold' : 'font-normal'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
