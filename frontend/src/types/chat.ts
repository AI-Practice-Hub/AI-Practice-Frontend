// Chat and Message related types

export type Sender = "user" | "bot";

export type MessageType = "text" | "image" | "pdf" | "audio";

export interface MessageAttachment {
  type: 'image' | 'pdf';
  name: string;
  url: string;
  size?: number;
}

export interface Message {
  id?: number;
  chat_id?: number;
  sender: Sender;
  content: string | null;
  file_type?: MessageType;
  file_name?: string;
  file_url?: string;
  invoke_type?: string;
  attachments?: MessageAttachment[]; // Support multiple attachments
  timestamp: string;
}

export interface Chat {
  id: number;
  user_id?: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateChatRequest {
  title: string;
}

export interface SendMessageRequest {
  type: MessageType;
  content?: string;
  file_name?: string;
  file_url?: string;
  file_size?: number;
}

export interface WebSocketMessage {
  message?: string;
  error?: string;
}

export interface ChatBotResponse {
  type: "ai_response" | "user_interrupt";
  response: string;
}
