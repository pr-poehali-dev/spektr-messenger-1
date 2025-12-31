import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useChats } from '@/contexts/ChatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChat: string | null;
  onShowProfile: () => void;
}

export default function ChatList({ onSelectChat, selectedChat, onShowProfile }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const { chats, searchUsers, createOrGetChat, getUserInfo } = useChats();
  const { user } = useAuth();

  const handleSearch = async () => {
    if (searchQuery.trim().length > 0) {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    const chatId = createOrGetChat(userId);
    setSearchQuery('');
    setShowSearch(false);
    setSearchResults([]);
    onSelectChat(chatId);
  };

  const getChatInfo = (chat: any) => {
    if (chat.isSystemChat) {
      return {
        id: 'spektr',
        name: 'Spektr',
        username: 'Spektr',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=spektr',
        isVerified: true,
      };
    }
    
    if (chat.isSavedMessages) {
      return {
        id: user?.id,
        name: 'Избранное',
        username: 'Сохранённые сообщения',
        avatar: user?.avatar,
        isVerified: false,
      };
    }

    const otherUserId = chat.participants.find((id: string) => id !== user?.id);
    return getUserInfo(otherUserId);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин`;
    if (diffHours < 24) return `${diffHours} ч`;
    if (diffDays < 7) return `${diffDays} д`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="w-full md:w-80 md:border-r border-border bg-card flex flex-col h-screen">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar 
              className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
              onClick={onShowProfile}
            >
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{user?.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold gradient-text text-lg">Spektr</h2>
              <p className="text-xs text-muted-foreground">{user?.username}</p>
            </div>
          </div>
        </div>

        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
          >
            <Icon name="Search" size={18} />
          </Button>
        </div>
      </div>

      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Результаты поиска</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            {searchResults.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Пользователи не найдены
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((foundUser) => (
                  <div
                    key={foundUser.id}
                    onClick={() => handleUserSelect(foundUser.id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={foundUser.avatar} alt={foundUser.name} />
                      <AvatarFallback>{foundUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <p className="font-medium">{foundUser.name}</p>
                        {foundUser.isVerified && (
                          <Icon name="BadgeCheck" size={16} className="text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">@{foundUser.username}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Написать
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {chats.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 px-4">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-2 opacity-20" />
              <p>Нет чатов</p>
              <p className="text-sm">Используйте поиск для начала переписки</p>
            </div>
          ) : (
            chats.map((chat) => {
              const chatInfo = getChatInfo(chat);
              if (!chatInfo) return null;

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-accent',
                    selectedChat === chat.id && 'bg-accent'
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chatInfo.avatar} alt={chatInfo.name} />
                      <AvatarFallback>{chatInfo.name[0]}</AvatarFallback>
                    </Avatar>
                    {!chat.isSystemChat && !chat.isSavedMessages && chatInfo.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-sm truncate">{chatInfo.name}</p>
                        {chatInfo.isVerified && (
                          <Icon name="BadgeCheck" size={14} className="text-blue-500 flex-shrink-0" />
                        )}
                        {chat.isSavedMessages && (
                          <Icon name="Bookmark" size={14} className="text-primary flex-shrink-0" />
                        )}
                      </div>
                      {chat.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage?.text || 'Нет сообщений'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2 h-5 min-w-5 flex items-center justify-center text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}