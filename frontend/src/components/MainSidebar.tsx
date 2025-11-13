"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, FileText, Settings, MessageCircle } from 'lucide-react';
import { BaseSidebar } from '@/components/ui/BaseSidebar';

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Projects", icon: FolderKanban, url: "/dashboard/projects" },
  { title: "Reports", icon: FileText, url: "/reports" },
  { title: "Settings", icon: Settings, url: "/settings" },
  { title: "Chat", icon: MessageCircle, url: "/chat" },
];

interface MainSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function MainSidebar({ open, onToggle }: MainSidebarProps) {
  const pathname = usePathname();

  const itemsWithActive = navItems.map(item => ({
    ...item,
    isActive: pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url)),
  }));

  return (
    <BaseSidebar
      navItems={itemsWithActive}
      open={open}
      onToggle={onToggle}
      title="AI Practice Hub"
    />
  );
}