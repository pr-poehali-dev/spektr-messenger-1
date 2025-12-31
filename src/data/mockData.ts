import { User, Chat, Message } from '@/types/chat';

export const currentUser: User = {
  id: 'user-1',
  username: 'Александр',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  bio: 'Frontend разработчик | Люблю создавать красивые интерфейсы',
  status: 'online',
  customStatus: '🚀 Работаю над проектом'
};

export const mockUsers: User[] = [
  {
    id: 'user-2',
    username: 'Мария',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    bio: 'UX/UI дизайнер',
    status: 'online',
    customStatus: '✨ В творческом процессе'
  },
  {
    id: 'user-3',
    username: 'Дмитрий',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry',
    bio: 'Backend developer',
    status: 'offline',
    customStatus: '💤 Сплю'
  },
  {
    id: 'user-4',
    username: 'Анна',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    bio: 'Product Manager',
    status: 'online',
    customStatus: ''
  },
  {
    id: 'user-5',
    username: 'Игорь',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Igor',
    bio: 'DevOps Engineer',
    status: 'offline',
    customStatus: '🎮 Играю в игры'
  }
];

export const mockMessages: Record<string, Message[]> = {
  'user-2': [
    {
      id: 'msg-1',
      sender_id: 'user-2',
      recipient_id: 'user-1',
      text: 'Привет! Как продвигается проект?',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      read: true
    },
    {
      id: 'msg-2',
      sender_id: 'user-1',
      recipient_id: 'user-2',
      text: 'Отлично! Уже закончил новый дизайн',
      created_at: new Date(Date.now() - 3000000).toISOString(),
      read: true
    },
    {
      id: 'msg-3',
      sender_id: 'user-2',
      recipient_id: 'user-1',
      text: 'Супер! Покажешь мне?',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      read: true
    }
  ],
  'user-3': [
    {
      id: 'msg-4',
      sender_id: 'user-3',
      recipient_id: 'user-1',
      text: 'API готово, можешь интегрировать',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      read: false
    }
  ],
  'user-4': [
    {
      id: 'msg-5',
      sender_id: 'user-1',
      recipient_id: 'user-4',
      text: 'Когда планируется релиз?',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      read: true
    },
    {
      id: 'msg-6',
      sender_id: 'user-4',
      recipient_id: 'user-1',
      text: 'На следующей неделе',
      created_at: new Date(Date.now() - 82800000).toISOString(),
      read: true
    }
  ]
};

export const mockChats: Chat[] = mockUsers.map(user => {
  const messages = mockMessages[user.id] || [];
  const lastMessage = messages[messages.length - 1];
  const unreadCount = messages.filter(m => !m.read && m.sender_id === user.id).length;

  return {
    id: user.id,
    user,
    lastMessage,
    unreadCount
  };
}).sort((a, b) => {
  const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
  const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
  return timeB - timeA;
});
