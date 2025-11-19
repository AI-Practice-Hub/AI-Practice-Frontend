import React from 'react';
import { AlignJustify } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavItem {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  url: string;
  isActive?: boolean;
}

interface BaseSidebarProps {
  navItems: NavItem[];
  open: boolean;
  onToggle: () => void;
  // Title can be a string or a React node (logo image)
  title?: React.ReactNode;
}

export const BaseSidebar = React.memo(function BaseSidebar({ navItems, open, onToggle, title = "Menu" }: BaseSidebarProps) {
  return (
    <aside
      className={`
        transition-all duration-200 shadow-lg h-full flex flex-col bg-sidebar
        md:relative fixed inset-y-0 left-0 z-50
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${open ? 'w-64' : 'w-0 md:w-16'}
        min-w-0 md:min-w-[4rem]
        border-r border-sidebar-border
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 pl-4 pr-2 pt-2 pb-2 min-h-[3.5rem] border-b border-sidebar-border">
        {open ? (
          <>
            <span className="font-bold text-lg flex-1 text-sidebar-foreground">
              {title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            >
              <AlignJustify size={24} />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="mx-auto w-full text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <AlignJustify size={24} />
          </Button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        {navItems.map((item) => (
          <a
            key={item.url}
            href={item.url}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth mb-2
              ${item.isActive
                ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }
            `}
            aria-label={`Navigate to ${item.title}`}
          >
            <item.icon size={20} />
            {open && <span>{item.title}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
});