import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, AlignJustify, ArrowLeft } from 'lucide-react';
import { Chat } from '@/types/chat';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChatItem } from './ChatItem';

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: number | null;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  onUpdateChat: (chatId: number, title: string) => Promise<void>;
  onDeleteChat: (chatId: number) => Promise<void>;
  open: boolean;
  onToggle: () => void;
}

export function ChatSidebar({
  chats,
  selectedChat,
  onSelectChat,
  onNewChat,
  onUpdateChat,
  onDeleteChat,
  open,
  onToggle,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats;
    }
    
    const query = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      const title = (chat.title || `Chat ${chat.id}`).toLowerCase();
      return title.includes(query);
    });
  }, [chats, searchQuery]);
  
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
              Chats
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
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

      {/* Back to Dashboard Button */}
      {open && (
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="flex items-center gap-2 mt-2 mb-2 w-[90%] mx-auto h-11 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      )}

      {/* New Chat Button - Hidden on mobile, shown on tablet+ */}
      {open ? (
        <Button
          onClick={onNewChat}
          className="hidden md:flex items-center gap-2 mt-2 mb-2 w-[90%] mx-auto h-11 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground"
        >
          <Plus size={18} />
          <span>New chat</span>
        </Button>
      ) : (
        <Button
          onClick={onNewChat}
          variant="ghost"
          size="icon"
          className="hidden md:flex items-center justify-center mx-auto mt-8 mb-2 w-10 h-10 text-sidebar-foreground hover:bg-sidebar-accent"
          title="New chat"
        >
          <Plus size={20} />
        </Button>
      )}

      {/* Search Input */}
      {open && (
        <div className="px-4 mb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}

      {/* Chats Label */}
      {open && (
        <div className="px-4 pt-2 pb-1">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold select-none">
            Chats
          </span>
        </div>
      )}

      {/* Chat List */}
      {open && (
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar" style={{ minHeight: 0 }}>
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChat === chat.id}
                onSelect={() => onSelectChat(chat.id)}
                onUpdate={onUpdateChat}
                onDelete={onDeleteChat}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                {searchQuery.trim() ? 'No chats found' : 'No chats yet'}
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
