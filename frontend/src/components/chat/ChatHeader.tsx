import React from 'react';
import { Menu } from 'lucide-react';

interface ChatHeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function ChatHeader({ title = 'AI Practice Hub', onMenuClick }: ChatHeaderProps) {
  return (
    <nav
      className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 md:py-4"
      style={{ backgroundColor: '#212121', borderBottom: '1px solid #505050ff' }}
    >
      {/* Mobile Menu Button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="md:hidden text-white mr-3 p-2 hover:bg-[#2a2a2a] rounded-lg transition"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      )}
      
      <span className="text-xl sm:text-2xl font-bold truncate" style={{ color: '#fff' }}>
        {title}
      </span>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Add user/profile/settings here */}
      </div>
    </nav>
  );
}
