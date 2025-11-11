"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Chat } from '@/types/chat';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChatActionsDropdown } from './ChatActionsDropdown';
import { useToast } from '@/hooks';

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (chatId: number, title: string) => Promise<void>;
  onDelete: (chatId: number) => Promise<void>;
}

export function ChatItem({ chat, isSelected, onSelect, onUpdate, onDelete }: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(chat.title || `Chat ${chat.id}`);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRename = () => {
    setIsEditing(true);
    setEditValue(chat.title || `Chat ${chat.id}`);
  };

  const handleSave = async () => {
    if (!editValue.trim()) {
      toast.error("Chat name cannot be empty");
      return;
    }

    if (editValue.trim() === (chat.title || `Chat ${chat.id}`)) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(chat.id, editValue.trim());
      setIsEditing(false);
      toast.success("Chat renamed successfully");
    } catch {
      toast.error("Failed to rename chat");
      // Reset to original value on error
      setEditValue(chat.title || `Chat ${chat.id}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditValue(chat.title || `Chat ${chat.id}`);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${chat.title || `Chat ${chat.id}`}"?`)) {
      try {
        await onDelete(chat.id);
        toast.success("Chat deleted successfully");
      } catch {
        toast.error("Failed to delete chat");
      }
    }
  };

  return (
    <div className="group relative">
      {isEditing ? (
        <div className="flex items-center gap-2 px-4 py-2 my-1">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isUpdating}
            className="flex-1 h-8 text-sm bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
            placeholder="Enter chat name"
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isUpdating || !editValue.trim()}
            className="h-8 px-2 text-xs"
          >
            {isUpdating ? '...' : 'Save'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating}
            className="h-8 px-2 text-xs"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={onSelect}
          className={`w-full justify-start text-left px-4 py-2 my-1 font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground pr-8 ${
            isSelected ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
          }`}
        >
          <span className="truncate block flex-1">
            {chat.title || `Chat ${chat.id}`}
          </span>
        </Button>
      )}

      {/* Actions dropdown - only show when not editing and on hover */}
      {!isEditing && (
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
          <ChatActionsDropdown
            onRename={handleRename}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}