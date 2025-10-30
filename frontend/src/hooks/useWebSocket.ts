import { useRef, useEffect, useCallback } from 'react';
import { getToken } from '@/lib/auth';
import { WS_BASE_URL } from '@/utils/constants';

export interface WebSocketMessage {
  type: 'text' | 'image' | 'pdf' | 'audio';
  content?: string;
  file_name?: string;
  file_size?: number;
  file_url?: string;
  duration?: number | null;
}

export interface UseWebSocketReturn {
  ws: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
}

export function useWebSocket(
  chatId: number | null,
  onMessage?: (data: any) => void
): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const isConnectedRef = useRef(false);
  const pendingMessagesRef = useRef<string[]>([]);
  
  // Store the callback in a ref to avoid recreating WebSocket on every render
  const onMessageRef = useRef(onMessage);
  
  // Update ref when callback changes, but don't trigger useEffect
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!chatId) {
      // Close existing connection if no chat selected
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        isConnectedRef.current = false;
      }
      return;
    }

    // Close existing connection before creating new one
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Build WebSocket URL with JWT token
    const token = getToken();
    const wsUrl = token
      ? `${WS_BASE_URL}/ws/chat/${chatId}?token=${token}`
      : `${WS_BASE_URL}/ws/chat/${chatId}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      isConnectedRef.current = true;
      
      // Send any pending messages
      if (pendingMessagesRef.current.length > 0) {
        pendingMessagesRef.current.forEach((msg) => {
          ws.send(msg);
        });
        pendingMessagesRef.current = [];
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Use ref.current to always get the latest callback
        if (onMessageRef.current) {
          onMessageRef.current(data);
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnectedRef.current = false;
    };

    ws.onclose = () => {
      isConnectedRef.current = false;
    };

    wsRef.current = ws;

    // Cleanup on unmount or chatId change
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      isConnectedRef.current = false;
    };
  }, [chatId]); // ✅ Only depends on chatId now!

  const sendMessage = useCallback((message: WebSocketMessage) => {
    const messageStr = JSON.stringify(message);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(messageStr);
    } else {
      // Queue message if not connected yet
      pendingMessagesRef.current.push(messageStr);
    }
  }, []);

  return {
    ws: wsRef.current,
    isConnected: isConnectedRef.current,
    sendMessage,
  };
}
