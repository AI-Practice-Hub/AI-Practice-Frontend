"use client";

import React from 'react';
import { AppSidebar } from './AppSidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarVariant?: 'main' | 'dashboard';
}

export function AppLayout({ children, sidebarVariant = 'main' }: AppLayoutProps) {
  const { open, toggle } = useSidebar();

  return (
    <ProtectedRoute>
      <div className="flex h-screen min-h-0 relative bg-background">
        {/* Mobile Sidebar Overlay */}
        {open && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={toggle}
          />
        )}

        {/* Sidebar */}
        <AppSidebar open={open} onToggle={toggle} variant={sidebarVariant} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}