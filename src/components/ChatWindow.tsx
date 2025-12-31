import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { mockChats, mockMessages, currentUser } from '@/data/mockData';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  chatId: string | null;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const chat = mockChats.find(c => c.id === chatId);

  useEffect(() => {
    if (chatId && mockMessages[chatId]) {
      setMessages(mockMessages[chatId]);
    } else {
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !chatId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender_id: currentUser.id,
      recipient_id: chatId,
      text: inputValue,
      created_at: new Date().toISOString(),
      read: false
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="gradient-bg w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Icon name="MessageCircle" className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold gradient-text mb-2">Добро пожаловать в Spektr</h2>
          <p className="text-muted-foreground">Выберите чат, чтобы начать общение</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="h-16 border-b border-border px-6 flex items-center gap-3 bg-card">
        <Avatar className="h-10 w-10">
          <AvatarImage src={chat.user.avatar_url} alt={chat.user.username} />
          <AvatarFallback>{chat.user.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{chat.user.username}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn(
              "w-2 h-2 rounded-full",
              chat.user.status === 'online' ? "bg-green-500" : "bg-gray-400"
            )} />
            <span>{chat.user.status === 'online' ? 'В сети' : 'Не в сети'}</span>
            {chat.user.customStatus && (
              <>
                <span>•</span>
                <span>{chat.user.customStatus}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => {
            const isMine = message.sender_id === currentUser.id;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-slide-in",
                  isMine && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage 
                    src={isMine ? currentUser.avatar_url : chat.user.avatar_url} 
                    alt={isMine ? currentUser.username : chat.user.username}
                  />
                  <AvatarFallback>
                    {isMine ? currentUser.username[0] : chat.user.username[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn("flex flex-col", isMine && "items-end")}>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 max-w-md",
                      isMine 
                        ? "gradient-bg text-white" 
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="break-words">{message.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatMessageTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Введите сообщение..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="gradient-bg"
          >
            <Icon name="Send" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
