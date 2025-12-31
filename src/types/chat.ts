export interface User {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  status: 'online' | 'offline';
  customStatus?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  text: string;
  created_at: string;
  read: boolean;
}

export interface Chat {
  id: string;
  user: User;
  lastMessage?: Message;
  unreadCount: number;
}
