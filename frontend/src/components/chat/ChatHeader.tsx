import React from 'react';

interface ChatHeaderProps {
  title?: string;
}

export function ChatHeader({ title = 'AI Practice Hub' }: ChatHeaderProps) {
  return (
    <nav
      className="flex items-center justify-between px-8 py-4"
      style={{ backgroundColor: '#212121' }}
    >
      <span className="text-2xl font-bold" style={{ color: '#fff' }}>
        {title}
      </span>
      <div className="flex items-center gap-4">
        {/* Add user/profile/settings here */}
      </div>
    </nav>
  );
}
