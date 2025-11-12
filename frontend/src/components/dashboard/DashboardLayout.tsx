"use client";

import React from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
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
        <DashboardSidebar open={open} onToggle={toggle} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}