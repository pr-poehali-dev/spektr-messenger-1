import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Chat, Message } from '@/types/chat';
import { useAuth } from './AuthContext';

interface ChatsContextType {
  chats: Chat[];
  getMessages: (chatId: string) => Message[];
  addMessage: (chatId: string, message: Message) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  editMessage: (chatId: string, messageId: string, newText: string) => void;
  forwardMessage: (messageId: string, targetChatId: string) => void;
  deleteChat: (chatId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  searchUsers: (query: string) => Promise<any[]>;
  createOrGetChat: (userId: string) => string;
  getUserInfo: (userId: string) => any;
}

const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export function ChatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!user) {
      setChats([]);
      return;
    }

    const savedChats = localStorage.getItem(`chats_${user.id}`);
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, [user]);

  const saveChats = (newChats: Chat[]) => {
    if (!user) return;
    setChats(newChats);
    localStorage.setItem(`chats_${user.id}`, JSON.stringify(newChats));
  };

  const getMessages = (chatId: string): Message[] => {
    if (!user) return [];
    const allMessages = JSON.parse(localStorage.getItem(`messages_${user.id}`) || '{}');
    return allMessages[chatId] || [];
  };

  const saveMessages = (chatId: string, messages: Message[]) => {
    if (!user) return;
    const allMessages = JSON.parse(localStorage.getItem(`messages_${user.id}`) || '{}');
    allMessages[chatId] = messages;
    localStorage.setItem(`messages_${user.id}`, JSON.stringify(allMessages));
  };

  const addMessage = (chatId: string, message: Message) => {
    const messages = getMessages(chatId);
    const updatedMessages = [...messages, message];
    saveMessages(chatId, updatedMessages);

    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessage = message;
      if (message.senderId !== user?.id) {
        chat.unreadCount = (chat.unreadCount || 0) + 1;
      }
      
      const updatedChats = [chat, ...chats.filter(c => c.id !== chatId)];
      saveChats(updatedChats);
    }
  };

  const deleteMessage = (chatId: string, messageId: string) => {
    const messages = getMessages(chatId);
    const updatedMessages = messages.filter(m => m.id !== messageId);
    saveMessages(chatId, updatedMessages);

    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.lastMessage?.id === messageId) {
      chat.lastMessage = updatedMessages[updatedMessages.length - 1];
      saveChats([...chats]);
    }
  };

  const editMessage = (chatId: string, messageId: string, newText: string) => {
    const messages = getMessages(chatId);
    const updatedMessages = messages.map(m =>
      m.id === messageId ? { ...m, text: newText, edited: true } : m
    );
    saveMessages(chatId, updatedMessages);

    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.lastMessage?.id === messageId) {
      chat.lastMessage.text = newText;
      chat.lastMessage.edited = true;
      saveChats([...chats]);
    }
  };

  const forwardMessage = (messageId: string, targetChatId: string) => {
    let originalMessage: Message | undefined;
    
    for (const chatId of chats.map(c => c.id)) {
      const messages = getMessages(chatId);
      originalMessage = messages.find(m => m.id === messageId);
      if (originalMessage) break;
    }

    if (!originalMessage || !user) return;

    const forwardedMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      chatId: targetChatId,
      senderId: user.id,
      text: originalMessage.text,
      timestamp: new Date().toISOString(),
      forwarded: true,
      forwardedFrom: originalMessage.senderId,
    };

    addMessage(targetChatId, forwardedMessage);
  };

  const deleteChat = (chatId: string) => {
    if (!user) return;
    
    const updatedChats = chats.filter(c => c.id !== chatId);
    saveChats(updatedChats);

    const allMessages = JSON.parse(localStorage.getItem(`messages_${user.id}`) || '{}');
    delete allMessages[chatId];
    localStorage.setItem(`messages_${user.id}`, JSON.stringify(allMessages));
  };

  const blockUser = (userId: string) => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const currentUserData = users[user.id];
    
    if (currentUserData) {
      currentUserData.user.blockedUsers = currentUserData.user.blockedUsers || [];
      if (!currentUserData.user.blockedUsers.includes(userId)) {
        currentUserData.user.blockedUsers.push(userId);
      }
      localStorage.setItem('users', JSON.stringify(users));
    }

    const chat = chats.find(c => c.participants.includes(userId));
    if (chat) {
      chat.isBlocked = true;
      saveChats([...chats]);
    }
  };

  const unblockUser = (userId: string) => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const currentUserData = users[user.id];
    
    if (currentUserData) {
      currentUserData.user.blockedUsers = (currentUserData.user.blockedUsers || []).filter(
        (id: string) => id !== userId
      );
      localStorage.setItem('users', JSON.stringify(users));
    }

    const chat = chats.find(c => c.participants.includes(userId));
    if (chat) {
      chat.isBlocked = false;
      saveChats([...chats]);
    }
  };

  const searchUsers = async (query: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    return Object.values(users)
      .map((u: any) => u.user)
      .filter((u: any) => 
        u.id !== user?.id && 
        u.username.toLowerCase().includes(query.toLowerCase())
      );
  };

  const createOrGetChat = (userId: string): string => {
    if (!user) return '';

    const existingChat = chats.find(c => 
      c.participants.includes(userId) && !c.isSystemChat && !c.isSavedMessages
    );

    if (existingChat) {
      return existingChat.id;
    }

    const newChat: Chat = {
      id: `chat_${Date.now()}_${userId}`,
      participants: [user.id, userId],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };

    saveChats([newChat, ...chats]);
    return newChat.id;
  };

  const getUserInfo = (userId: string) => {
    if (userId === 'spektr') {
      return {
        id: 'spektr',
        username: 'Spektr',
        name: 'Spektr',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=spektr',
        isVerified: true,
      };
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    return users[userId]?.user || null;
  };

  return (
    <ChatsContext.Provider
      value={{
        chats,
        getMessages,
        addMessage,
        deleteMessage,
        editMessage,
        forwardMessage,
        deleteChat,
        blockUser,
        unblockUser,
        searchUsers,
        createOrGetChat,
        getUserInfo,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
}

export function useChats() {
  const context = useContext(ChatsContext);
  if (context === undefined) {
    throw new Error('useChats must be used within a ChatsProvider');
  }
  return context;
}
