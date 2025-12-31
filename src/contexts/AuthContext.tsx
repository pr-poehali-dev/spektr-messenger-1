import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/chat';
import { LoginData, RegisterData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => boolean;
  register: (data: RegisterData) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const userData = users[currentUserId];
      if (userData) {
        setUser(userData.user);
      }
    }
  }, []);

  const register = (data: RegisterData): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (Object.values(users).some((u: any) => u.user.username === data.username)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: data.username,
      name: data.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      bio: '',
      status: 'online',
      customStatus: '',
      isVerified: false,
      blockedUsers: [],
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      showLastSeen: true,
    };

    users[newUser.id] = {
      user: newUser,
      password: data.password,
    };

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUserId', newUser.id);
    setUser(newUser);

    initializeDefaultChats(newUser.id);
    
    return true;
  };

  const login = (data: LoginData): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userEntry = Object.values(users).find(
      (u: any) => u.user.username === data.username && u.password === data.password
    );

    if (!userEntry) {
      return false;
    }

    const userData = (userEntry as any).user;
    localStorage.setItem('currentUserId', userData.id);
    setUser(userData);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('currentUserId');
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[user.id]) {
      users[user.id].user = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
      setUser(updatedUser);
    }
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    if (!user) return false;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userEntry = users[user.id];

    if (!userEntry || userEntry.password !== oldPassword) {
      return false;
    }

    userEntry.password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  };

  const initializeDefaultChats = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (!users['spektr']) {
      users['spektr'] = {
        user: {
          id: 'spektr',
          username: 'spektr',
          name: 'Spektr',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=spektr',
          bio: 'Официальный аккаунт Spektr',
          status: 'online',
          customStatus: 'Всегда на связи',
          isVerified: true,
          blockedUsers: [],
          createdAt: new Date('2014-01-01').toISOString(),
          lastSeenAt: new Date().toISOString(),
          showLastSeen: true,
        },
        password: 'zzzz-2014',
      };
      localStorage.setItem('users', JSON.stringify(users));
    }

    const chats = JSON.parse(localStorage.getItem(`chats_${userId}`) || '[]');
    
    if (chats.length === 0) {
      const defaultChats = [
        {
          id: 'spektr_official',
          participants: [userId, 'spektr'],
          isSystemChat: true,
          isSavedMessages: false,
          createdAt: new Date().toISOString(),
          lastMessage: {
            id: 'welcome',
            chatId: 'spektr_official',
            senderId: 'spektr',
            text: 'Здравствуйте! Добро пожаловать в Spektr!',
            timestamp: new Date().toISOString(),
            read: false,
          },
          unreadCount: 1,
        },
        {
          id: `saved_${userId}`,
          participants: [userId],
          isSystemChat: false,
          isSavedMessages: true,
          createdAt: new Date().toISOString(),
          unreadCount: 0,
        },
      ];

      localStorage.setItem(`chats_${userId}`, JSON.stringify(defaultChats));

      const messages = {
        spektr_official: [
          {
            id: 'welcome',
            chatId: 'spektr_official',
            senderId: 'spektr',
            text: 'Здравствуйте! Добро пожаловать в Spektr!',
            timestamp: new Date().toISOString(),
            read: false,
          },
        ],
        [`saved_${userId}`]: [],
      };

      localStorage.setItem(`messages_${userId}`, JSON.stringify(messages));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}