import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Chat, Message } from '@/types/chat';

export interface UseChatReturn {
  chats: Chat[];
  selectedChat: number | null;
  messages: Message[];
  loading: boolean;
  createChat: (title?: string, projectId?: number) => Promise<Chat>;
  selectChat: (chatId: number | null) => void;
  updateChat: (chatId: number, title: string) => Promise<void>;
  deleteChat: (chatId: number) => Promise<void>;
  addMessage: (message: Message) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  refreshChats: () => Promise<void>;
}

export function useChat(projectId?: number): UseChatReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshChats = useCallback(async () => {
    try {
      setLoading(true);
      const params = projectId ? { project_id: projectId } : {};
      const res = await api.get('/chat/', { params });
      setChats(res.data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchMessages = useCallback(async (chatId: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/chat/${chatId}/messages`);
      setMessages(res.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch chats on mount and when projectId changes
  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    } else {
      setMessages([]);
    }
  }, [selectedChat, fetchMessages]);

  const createChat = useCallback(async (title: string = 'New Chat', projectIdParam?: number): Promise<Chat> => {
    try {
      const res = await api.post('/chat/', { 
        title,
        project_id: projectIdParam || projectId 
      });
      const newChat = res.data;
      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat.id);
      setMessages([]);
      return newChat;
    } catch (error) {
      console.error('Failed to create chat:', error);
      throw error;
    }
  }, [projectId]);

  const selectChat = useCallback((chatId: number | null) => {
    setSelectedChat(chatId);
  }, []);

  const updateChat = useCallback(async (chatId: number, title: string) => {
    try {
      await api.put(`/chat/${chatId}`, { title });
      setChats((prev) => prev.map((chat) => 
        chat.id === chatId ? { ...chat, title } : chat
      ));
    } catch (error) {
      console.error('Failed to update chat:', error);
      throw error;
    }
  }, []);

  const deleteChat = useCallback(async (chatId: number) => {
    try {
      await api.delete(`/chat/${chatId}`);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      
      // If deleted chat was selected, clear selection
      if (selectedChat === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      throw error;
    }
  }, [selectedChat]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return {
    chats,
    selectedChat,
    messages,
    loading,
    createChat,
    selectChat,
    updateChat,
    deleteChat,
    addMessage,
    setMessages,
    refreshChats,
  };
}
