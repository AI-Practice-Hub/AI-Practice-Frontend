"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderKanban, FileText, Settings, MessageCircle, LogOut, Moon, Sun, MoreHorizontal, User } from 'lucide-react';
import { useTheme } from "next-themes";
import { BaseSidebar } from '@/components/ui/BaseSidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
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

  const handleSettings = () => {
    router.push(variant === 'main' ? '/settings' : '/dashboard/settings');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const displayName = user?.email?.split('@')[0] || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();

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
      footer={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={`${open ? 'w-full' : ''} flex items-center gap-2 px-2 hover:bg-sidebar-accent h-auto py-2 ${open ? 'justify-start' : 'justify-center'}`}
            >
              <Avatar className="h-8 w-8 rounded-lg flex-shrink-0">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {open && (
                <>
                  <div className="flex flex-col items-start text-left flex-1 overflow-hidden min-w-0">
                    <span className="text-sm font-medium truncate w-full text-sidebar-foreground">{displayName}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">{user?.email}</span>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" 
            align="end" 
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal p-0">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleThemeToggle}>
                {theme === 'dark' ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark mode</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
}