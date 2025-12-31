export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  bio?: string;
  status?: 'online' | 'offline';
  customStatus?: string;
  isVerified?: boolean;
  blockedUsers?: string[];
  createdAt: string;
  lastSeenAt?: string;
  showLastSeen?: boolean;
}

export interface MediaAttachment {
  type: 'image' | 'video' | 'document';
  url: string;
  name?: string;
  size?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read?: boolean;
  edited?: boolean;
  forwarded?: boolean;
  forwardedFrom?: string;
  media?: MediaAttachment;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isBlocked?: boolean;
  isSystemChat?: boolean;
  isSavedMessages?: boolean;
  createdAt: string;
}

export interface MessageAction {
  type: 'delete' | 'forward' | 'edit';
  messageId: string;
}