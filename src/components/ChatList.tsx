import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { mockChats, currentUser } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChat: string | null;
  onShowProfile: () => void;
}

export default function ChatList({ onSelectChat, selectedChat, onShowProfile }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar 
              className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
              onClick={onShowProfile}
            >
              <AvatarImage src={currentUser.avatar_url} alt={currentUser.username} />
              <AvatarFallback>{currentUser.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold gradient-text text-lg">Spektr</h2>
              <p className="text-xs text-muted-foreground">{currentUser.username}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-none"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all mb-1",
                "hover:bg-muted/50",
                selectedChat === chat.id && "bg-primary/10 hover:bg-primary/15"
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.user.avatar_url} alt={chat.user.username} />
                  <AvatarFallback>{chat.user.username[0]}</AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                  chat.user.status === 'online' ? "bg-green-500" : "bg-gray-400"
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium truncate">{chat.user.username}</h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {formatTime(chat.lastMessage.created_at)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.user.customStatus || chat.lastMessage?.text || 'Нет сообщений'}
                  </p>
                  {chat.unreadCount > 0 && (
                    <Badge className="ml-2 gradient-bg">{chat.unreadCount}</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredChats.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Search" className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Ничего не найдено</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
