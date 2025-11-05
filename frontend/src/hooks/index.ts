// Custom Hooks
export { useAuth } from './useAuth';
export { useChat } from './useChat';
export { useWebSocket } from './useRestApi'; // REST API implementation with WebSocket interface
export { useAudioRecorder } from './useAudioRecorder';
export { useToast } from './useToast';

// Type exports
export type { UseChatReturn } from './useChat';
export type { UseWebSocketReturn, WebSocketMessage, ChatBotResponse } from './useRestApi'; // Updated import
export type { AudioRecorderReturn } from './useAudioRecorder';
