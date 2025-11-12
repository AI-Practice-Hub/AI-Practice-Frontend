"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Settings, FolderKanban, MessageCircle } from 'lucide-react';
import { BaseSidebar } from '@/components/ui/BaseSidebar';

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Projects", icon: FolderKanban, url: "/dashboard/projects" },
  { title: "Reports", icon: FileText, url: "/dashboard/reports" },
  { title: "Settings", icon: Settings, url: "/dashboard/settings" },
  { title: "Chat", icon: MessageCircle, url: "/chat" },
];

interface DashboardSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ open, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();

  const itemsWithActive = navItems.map(item => ({
    ...item,
    isActive: pathname === item.url,
  }));

  return (
    <BaseSidebar
      navItems={itemsWithActive}
      open={open}
      onToggle={onToggle}
      title="Dashboard"
    />
  );
}