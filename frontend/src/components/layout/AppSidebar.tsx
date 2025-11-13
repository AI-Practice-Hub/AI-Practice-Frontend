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

  const itemsWithActive = navItems.map(item => ({
    ...item,
    isActive: pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url)),
  }));

  return (
    <BaseSidebar
      navItems={itemsWithActive}
      open={open}
      onToggle={onToggle}
      title={variant === 'main' ? "AI Practice Hub" : "Dashboard"}
    />
  );
}