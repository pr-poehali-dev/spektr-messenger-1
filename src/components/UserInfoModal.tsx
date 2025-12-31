import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { User } from '@/types/chat';

interface UserInfoModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onStartChat?: () => void;
}

export default function UserInfoModal({ user, open, onClose, onStartChat }: UserInfoModalProps) {
  if (!user) return null;

  const formatLastSeen = (lastSeenAt?: string) => {
    if (!lastSeenAt) return 'Давно';
    
    const date = new Date(lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const getStatusText = () => {
    if (user.status === 'online') {
      return { text: 'В сети', color: 'bg-green-400', show: true };
    }
    
    if (!user.showLastSeen) {
      return { text: 'Не в сети', color: 'bg-gray-400', show: true };
    }

    return { 
      text: `Был(а) ${formatLastSeen(user.lastSeenAt)}`, 
      color: 'bg-gray-400', 
      show: true 
    };
  };

  const statusInfo = getStatusText();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Информация о пользователе</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
              </Avatar>
              <div 
                className={`absolute bottom-2 right-2 w-5 h-5 ${statusInfo.color} rounded-full border-4 border-background`}
              />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold">{user.name}</h3>
              {user.isVerified && (
                <Icon name="BadgeCheck" size={20} className="text-blue-500" />
              )}
            </div>
            
            <p className="text-muted-foreground mb-1">@{user.username}</p>
            
            <Badge variant="secondary" className="mb-4">
              <div className={`w-2 h-2 rounded-full mr-2 ${statusInfo.color}`} />
              {statusInfo.text}
            </Badge>

            {user.customStatus && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Icon name="Quote" size={14} />
                <span className="italic">{user.customStatus}</span>
              </div>
            )}
          </div>

          {user.bio && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon name="FileText" size={16} />
                <span>О себе</span>
              </div>
              <p className="text-sm pl-6">{user.bio}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon name="Calendar" size={16} />
              <span>Дата регистрации</span>
            </div>
            <p className="text-sm pl-6">
              {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {onStartChat && (
            <Button onClick={onStartChat} className="w-full gradient-bg">
              <Icon name="MessageCircle" size={18} className="mr-2" />
              Написать сообщение
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
