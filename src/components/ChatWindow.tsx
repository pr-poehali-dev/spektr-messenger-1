import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import UserInfoModal from '@/components/UserInfoModal';
import { useChats } from '@/contexts/ChatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { playMessageSent } from '@/lib/sounds';

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
}

export default function ChatWindow({ chatId, onBack }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [forwardingMessageId, setForwardingMessageId] = useState<string | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const {
    chats,
    getMessages,
    addMessage,
    deleteMessage,
    editMessage,
    forwardMessage,
    deleteChat,
    blockUser,
    unblockUser,
    getUserInfo,
  } = useChats();

  const chat = chats.find((c) => c.id === chatId);
  const messages = getMessages(chatId);
  const chatInfo = chat ? getChatInfo(chat) : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  function getChatInfo(chat: any) {
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
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      chatId,
      senderId: user?.id || '',
      text: inputValue,
      timestamp: new Date().toISOString(),
      read: false,
    };

    addMessage(chatId, newMessage);
    setInputValue('');
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(chatId, messageId);
  };

  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditText(message.text);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editText.trim()) {
      editMessage(chatId, editingMessageId, editText);
      setEditingMessageId(null);
      setEditText('');
    }
  };

  const handleForward = (targetChatId: string) => {
    if (forwardingMessageId) {
      forwardMessage(forwardingMessageId, targetChatId);
      setForwardingMessageId(null);
    }
  };

  const handleDeleteChat = () => {
    if (confirm('Удалить чат?')) {
      deleteChat(chatId);
      onBack();
    }
  };

  const handleBlockUser = () => {
    const otherUserId = chat?.participants.find((id: string) => id !== user?.id);
    if (otherUserId) {
      if (chat?.isBlocked) {
        unblockUser(otherUserId);
      } else {
        blockUser(otherUserId);
      }
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const isSystemChat = chat?.isSystemChat;
  const isSavedMessages = chat?.isSavedMessages;
  const isBlocked = chat?.isBlocked;

  if (!chat || !chatInfo) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Icon name="MessageCircle" size={48} className="mx-auto mb-2 opacity-20" />
          <p className="text-muted-foreground">Чат не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background h-screen">
      <div className="h-16 border-b border-border px-4 md:px-6 flex items-center justify-between bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <Avatar 
            className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => !isSavedMessages && setShowUserInfo(true)}
          >
            <AvatarImage src={chatInfo.avatar} alt={chatInfo.name} />
            <AvatarFallback>{chatInfo.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <p className="font-semibold">{chatInfo.name}</p>
              {chatInfo.isVerified && (
                <Icon name="BadgeCheck" size={16} className="text-blue-500" />
              )}
              {isSavedMessages && (
                <Icon name="Bookmark" size={16} className="text-primary" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isSavedMessages ? 'Ваши сохранённые сообщения' : `@${chatInfo.username}`}
            </p>
          </div>
        </div>

        {!isSystemChat && !isSavedMessages && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icon name="MoreVertical" size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBlockUser}>
                <Icon name={isBlocked ? 'Unlock' : 'Ban'} size={16} className="mr-2" />
                {isBlocked ? 'Разблокировать' : 'Заблокировать'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteChat} className="text-destructive">
                <Icon name="Trash2" size={16} className="mr-2" />
                Удалить чат
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="space-y-4">
          {messages.map((message) => {
            const isMine = message.senderId === user?.id;
            const senderInfo = getUserInfo(message.senderId);

            return (
              <div
                key={message.id}
                className={cn('flex gap-3 group', isMine && 'flex-row-reverse')}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={senderInfo?.avatar} alt={senderInfo?.name} />
                  <AvatarFallback>{senderInfo?.name?.[0]}</AvatarFallback>
                </Avatar>

                <div className={cn('flex flex-col max-w-[75%]', isMine && 'items-end')}>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2 relative',
                        isMine ? 'gradient-bg text-white' : 'bg-muted text-foreground'
                      )}
                    >
                      {message.forwarded && (
                        <p className="text-xs opacity-70 mb-1">
                          <Icon name="Forward" size={12} className="inline mr-1" />
                          Переслано
                        </p>
                      )}
                      <p className="break-words">{message.text}</p>
                      {message.edited && (
                        <span className="text-xs opacity-70 ml-2">изменено</span>
                      )}
                    </div>

                    {isMine && !isSystemChat && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icon name="MoreVertical" size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isMine ? 'end' : 'start'}>
                          <DropdownMenuItem onClick={() => handleStartEdit(message)}>
                            <Icon name="Edit" size={16} className="mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setForwardingMessageId(message.id)}>
                            <Icon name="Forward" size={16} className="mr-2" />
                            Переслать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-destructive"
                          >
                            <Icon name="Trash2" size={16} className="mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {!isSystemChat && !isBlocked && (
        <div className="border-t border-border p-4 bg-card flex-shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder="Написать сообщение..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon" className="flex-shrink-0">
              <Icon name="Send" size={20} />
            </Button>
          </div>
        </div>
      )}

      {isBlocked && (
        <div className="border-t border-border p-4 bg-muted/50 text-center flex-shrink-0">
          <p className="text-sm text-muted-foreground">
            <Icon name="Ban" size={16} className="inline mr-1" />
            Пользователь заблокирован
          </p>
        </div>
      )}

      <Dialog open={!!editingMessageId} onOpenChange={() => setEditingMessageId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать сообщение</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMessageId(null)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserInfoModal 
        user={chatInfo && !isSavedMessages ? getUserInfo(chatInfo.id) : null}
        open={showUserInfo}
        onClose={() => setShowUserInfo(false)}
      />

      <Dialog open={!!forwardingMessageId} onOpenChange={() => setForwardingMessageId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переслать сообщение</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            {chats
              .filter((c) => c.id !== chatId && !c.isSystemChat)
              .map((c) => {
                const info = getChatInfo(c);
                return (
                  <div
                    key={c.id}
                    onClick={() => handleForward(c.id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <Avatar>
                      <AvatarImage src={info?.avatar} alt={info?.name} />
                      <AvatarFallback>{info?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{info?.name}</p>
                  </div>
                );
              })}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}