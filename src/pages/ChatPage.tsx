import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import ChatWindow from '@/components/ChatWindow';
import { useChats } from '@/hooks/useChats';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { chats } = useChats();
  
  const chat = chats.find(c => c.id === chatId);

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-muted-foreground mb-4">Чат не найден</p>
        <Button onClick={() => navigate('/')}>Вернуться к чатам</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="h-16 border-b border-border px-4 flex items-center gap-3 bg-card flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <Icon name="ArrowLeft" className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={chat.user.avatar_url} alt={chat.user.username} />
          <AvatarFallback>{chat.user.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{chat.user.username}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn(
              "w-2 h-2 rounded-full",
              chat.user.status === 'online' ? "bg-green-500" : "bg-gray-400"
            )} />
            <span>{chat.user.status === 'online' ? 'В сети' : 'Не в сети'}</span>
            {chat.user.customStatus && (
              <>
                <span>•</span>
                <span className="truncate">{chat.user.customStatus}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <ChatWindow chatId={chatId || null} />
    </div>
  );
}
