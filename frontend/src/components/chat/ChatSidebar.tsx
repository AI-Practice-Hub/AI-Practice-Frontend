import React, { useState, useMemo } from 'react';
import { Search, Plus, AlignJustify } from 'lucide-react';
import { Chat } from '@/types/chat';

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: number | null;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
  open: boolean;
  onToggle: () => void;
}

export function ChatSidebar({
  chats,
  selectedChat,
  onSelectChat,
  onNewChat,
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
        transition-all duration-200 shadow-lg h-full flex flex-col
        md:relative fixed inset-y-0 left-0 z-50
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${open ? 'w-64' : 'w-0 md:w-16'}
        min-w-0 md:min-w-[4rem]
      `}
      style={{
        backgroundColor: '#171717',
        paddingTop: '0.5rem',
        paddingBottom: '1.25rem',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 pl-4 pr-2 pt-2 pb-2 min-h-[3.5rem]"
        style={{ borderBottom: 'none' }}
      >
        {open ? (
          <>
            <span className="font-bold text-lg flex-1" style={{ color: '#fff' }}>
              Chats
            </span>
            <button
              onClick={onToggle}
              className="text-2xl"
              style={{ color: '#fff' }}
            >
              <AlignJustify size={24} />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="mx-auto text-2xl w-full flex items-center justify-center"
            style={{ color: '#fff' }}
          >
            <AlignJustify size={24} />
          </button>
        )}
      </div>

      {/* New Chat Button - Hidden on mobile, shown on tablet+ */}
      {open ? (
        <button
          onClick={onNewChat}
          className="hidden md:flex items-center gap-2 pl-3 pr-3 py-2 mt-1 mb-2 rounded-lg bg-[#232323] hover:bg-[#292929] text-white font-semibold transition shadow-none border border-[#232323] w-[90%] mx-auto h-11 min-h-[44px]"
        >
          <Plus size={18} />
          <span>New chat</span>
        </button>
      ) : (
        <button
          onClick={onNewChat}
          className="hidden md:flex items-center justify-center mx-auto mt-8 mb-2 w-10 h-10 rounded-full bg-[#232323] hover:bg-[#292929] text-white transition shadow-none border border-[#232323]"
          title="New chat"
        >
          <Plus size={20} />
        </button>
      )}

      {/* Search Input */}
      {open && (
        <div className="pl-4 pr-4 mb-2">
          <div className="flex items-center bg-[#181818] rounded-lg px-3 py-2 border border-[#232323]">
            <Search size={16} className="text-[#bdbdbd] mr-2" />
            <input
              type="text"
              placeholder="Search chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[#bdbdbd] text-sm flex-1 font-normal"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            />
          </div>
        </div>
      )}

      {/* Chats Label */}
      {open && (
        <div className="pl-4 pr-4 pt-2 pb-1">
          <span
            className="text-xs uppercase tracking-widest text-[#bdbdbd] font-semibold select-none"
            style={{ letterSpacing: '0.08em' }}
          >
            Chats
          </span>
        </div>
      )}

      {/* Chat List */}
      {open && (
        <div
          className="flex-1 overflow-y-auto pl-4 pr-4 custom-scrollbar"
          style={{ minHeight: 0 }}
        >
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-4 py-2 my-1 rounded-lg transition font-normal text-white ${
                  selectedChat === chat.id ? 'bg-[#232323]' : 'hover:bg-[#181818]'
                }`}
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 400,
                  borderRadius: 10,
                }}
              >
                {chat.title || `Chat ${chat.id}`}
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-[#888] text-sm">
                {searchQuery.trim() ? 'No chats found' : 'No chats yet'}
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
