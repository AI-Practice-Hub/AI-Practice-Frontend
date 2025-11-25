import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserMenu } from '@/components/ui/UserMenu';

interface ChatHeaderProps {
  title?: string;
  onMenuClick?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onSettings?: () => void;
}

export function ChatHeader({
  title = 'TestSamurAI',
  onMenuClick,
  user,
  onLogout,
  onSettings
}: ChatHeaderProps) {
  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 bg-card border-b border-border">
      {/* Mobile Menu Button */}
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden mr-3"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </Button>
      )}

      <span className="text-xl sm:text-2xl font-bold truncate text-foreground">
        {title}
      </span>
      <div className="flex items-center gap-2 sm:gap-4">
        <UserMenu
          user={user}
          onLogout={onLogout}
          onSettings={onSettings}
        />
      </div>
    </nav>
  );
}
