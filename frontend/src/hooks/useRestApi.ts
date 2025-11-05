import { useRef, useCallback } from 'react';
import { api } from '@/lib/api';

export interface WebSocketMessage {
  type?: 'text' | 'image' | 'pdf' | 'audio'; // Optional since backend determines it
  content?: string;
  file_name?: string;
  file_size?: number;
  file_url?: string;
  duration?: number | null;
  files?: File[]; // Add support for actual file objects
  invokeType?: 'new' | 'resume'; // Add invoke type
}

export interface UseWebSocketReturn {
  ws: null; // Not needed for REST API
  isConnected: boolean; // Always true for REST API
  sendMessage: (message: WebSocketMessage) => void;
}

export interface ChatBotResponse {
  type: "ai_response" | "user_interrupt";
  response: string;
}

export function useWebSocket(
  chatId: number | null,
  onMessage?: (data: any) => void,
  messagesCount?: number // Add messages count to determine invoke_type
): UseWebSocketReturn {
  // Store the callback in a ref to avoid issues
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const sendMessage = useCallback(async (message: WebSocketMessage) => {
    if (!chatId) {
      console.warn('No chat selected for sending message');
      return;
    }

    try {
      // Determine invoke_type based on messages count
      const invokeType = (messagesCount === 0) ? 'new' : 'resume';
      
      // Prepare FormData for the REST API call
      const formData = new FormData();
      
      if (message.content) {
        formData.append('content', message.content);
      }
      
      // Handle file uploads
      if (message.files && message.files.length > 0) {
        message.files.forEach((file) => {
          formData.append('files', file);
        });
      }

      // Call the new REST API endpoint with invoke_type as query parameter
      const response = await api.post(
        `/chat/${chatId}/send-message?invoke_type=${invokeType}`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const botResponse: ChatBotResponse = response.data;

      // Simulate the same WebSocket callback behavior
      if (onMessageRef.current) {
        onMessageRef.current({
          message: botResponse.response,
          type: botResponse.type, // For future use (user_interrupt, etc.)
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Send error callback just like WebSocket would
      if (onMessageRef.current) {
        onMessageRef.current({
          error: 'Failed to send message. Please try again.',
        });
      }
    }
  }, [chatId, messagesCount]);

  return {
    ws: null, // No WebSocket needed
    isConnected: true, // Always "connected" for REST API
    sendMessage,
  };
}