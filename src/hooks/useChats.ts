import { useState, useEffect } from 'react';
import { Chat, Message, User } from '@/types/chat';

const STORAGE_KEYS = {
  CHATS: 'spektr_chats',
  MESSAGES: 'spektr_messages',
  CURRENT_USER: 'spektr_current_user'
};

const defaultUser: User = {
  id: 'user-1',
  username: 'Пользователь',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
  bio: 'Привет! Я использую Spektr',
  status: 'online',
  customStatus: ''
};

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  useEffect(() => {
    const savedChats = localStorage.getItem(STORAGE_KEYS.CHATS);
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const saveChats = (newChats: Chat[]) => {
    setChats(newChats);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(newChats));
  };

  const saveCurrentUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  };

  const addChat = (user: User) => {
    const existingChat = chats.find(c => c.id === user.id);
    if (existingChat) return;

    const newChat: Chat = {
      id: user.id,
      user,
      unreadCount: 0
    };

    saveChats([newChat, ...chats]);
  };

  const deleteChat = (chatId: string) => {
    const newChats = chats.filter(c => c.id !== chatId);
    saveChats(newChats);
    
    const messages = getMessages(chatId);
    const allMessages = getAllMessages();
    delete allMessages[chatId];
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
  };

  return {
    chats,
    currentUser,
    addChat,
    deleteChat,
    saveChats,
    saveCurrentUser
  };
}

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const allMessages = getAllMessages();
    setMessages(allMessages[chatId] || []);
  }, [chatId]);

  const addMessage = (chatId: string, message: Message) => {
    const allMessages = getAllMessages();
    const chatMessages = allMessages[chatId] || [];
    const updatedMessages = [...chatMessages, message];
    
    allMessages[chatId] = updatedMessages;
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
    setMessages(updatedMessages);

    updateChatLastMessage(chatId, message);
  };

  return {
    messages,
    addMessage
  };
}

function getAllMessages(): Record<string, Message[]> {
  const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return saved ? JSON.parse(saved) : {};
}

function getMessages(chatId: string): Message[] {
  const allMessages = getAllMessages();
  return allMessages[chatId] || [];
}

function updateChatLastMessage(chatId: string, message: Message) {
  const savedChats = localStorage.getItem(STORAGE_KEYS.CHATS);
  if (!savedChats) return;

  const chats: Chat[] = JSON.parse(savedChats);
  const chatIndex = chats.findIndex(c => c.id === chatId);
  
  if (chatIndex !== -1) {
    chats[chatIndex].lastMessage = message;
    
    chats.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
      return timeB - timeA;
    });
    
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }
}
