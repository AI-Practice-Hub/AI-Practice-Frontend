"use client";

import React from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/Button';

interface ChatActionsDropdownProps {
  onRename: () => void;
  onDelete: () => void;
}

export function ChatActionsDropdown({ onRename, onDelete }: ChatActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <MoreVertical size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onRename} className="cursor-pointer">
          <Edit size={14} className="mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 size={14} className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}