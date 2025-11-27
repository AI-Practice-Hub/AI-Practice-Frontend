// Custom Hooks
export { useAuth } from './useAuth';
export { useChat } from './useChat';
export { useWebSocket as useApi } from './useRestApi'; // REST API hook with WebSocket-like interface
export { useToast } from './useToast';
export { useNotifications } from './useNotifications';

// Type exports
export type { UseChatReturn } from './useChat';
export type { UseWebSocketReturn as UseApiReturn, WebSocketMessage as ApiMessage, ChatBotResponse } from './useRestApi';
