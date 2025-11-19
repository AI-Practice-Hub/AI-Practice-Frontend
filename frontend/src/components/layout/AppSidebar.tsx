"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, FileText, Settings, MessageCircle } from 'lucide-react';
import { BaseSidebar } from '@/components/ui/BaseSidebar';

const mainNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Projects", icon: FolderKanban, url: "/dashboard/projects" },
  { title: "Reports", icon: FileText, url: "/reports" },
  { title: "Settings", icon: Settings, url: "/settings" },
  { title: "Chat", icon: MessageCircle, url: "/chat" },
];

const dashboardNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Projects", icon: FolderKanban, url: "/dashboard/projects" },
  { title: "Reports", icon: FileText, url: "/dashboard/reports" },
  { title: "Settings", icon: Settings, url: "/dashboard/settings" },
];

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
  variant: 'main' | 'dashboard';
}

export function AppSidebar({ open, onToggle, variant }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = variant === 'main' ? mainNavItems : dashboardNavItems;

  // To avoid marking parent paths (e.g., /dashboard) as active when a deeper route is active
  // choose the nav item with the longest matching url prefix. This prevents /dashboard from
  // staying active when /dashboard/projects is the active page.
  const activeItem = navItems.reduce((best, item) => {
    const matches = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url + '/')) || pathname.startsWith(item.url) && item.url === pathname;
    if (!matches) return best;
    if (!best || item.url.length > best.url.length) return item;
    return best;
  }, undefined as any);

  const itemsWithActive = navItems.map(item => ({
    ...item,
    isActive: activeItem ? activeItem.url === item.url : pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url)),
  }));

  return (
    <BaseSidebar
      navItems={itemsWithActive}
      open={open}
      onToggle={onToggle}
      title={
          <div className="flex items-center gap-2">
            <img src="/company-logo.png" alt="TestSamurai" className="h-10 w-auto bg-white p-1 rounded-md shadow-sm" />
          </div>
      }
    />
  );
}