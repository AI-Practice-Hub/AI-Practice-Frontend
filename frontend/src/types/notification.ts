export interface Notification {
  id: number;
  user_id: number;
  chat_id: number;
  project_id: number;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
}
