import { AppLayout } from '@/components/layout/AppLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppLayout sidebarVariant="dashboard">{children}</AppLayout>;
}