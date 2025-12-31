import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { currentUser as initialUser } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ProfileProps {
  onClose: () => void;
}

export default function Profile({ onClose }: ProfileProps) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="ArrowLeft" className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Профиль</h2>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          variant={isEditing ? 'default' : 'outline'}
          className={cn(isEditing && 'gradient-bg')}
        >
          <Icon name={isEditing ? 'Check' : 'Edit'} className="h-4 w-4 mr-2" />
          {isEditing ? 'Сохранить' : 'Редактировать'}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-2xl mx-auto space-y-6">
          <Card className="border-2 border-primary/20 animate-fade-in">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                  <AvatarImage src={user.avatar_url} alt={user.username} />
                  <AvatarFallback className="text-2xl">{user.username[0]}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="gradient-text text-2xl">{user.username}</CardTitle>
              <CardDescription className="text-base">{user.bio}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Badge variant={user.status === 'online' ? 'default' : 'secondary'} className="gradient-bg">
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    user.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                  )} />
                  {user.status === 'online' ? 'В сети' : 'Не в сети'}
                </Badge>
              </div>

              {isEditing ? (
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input
                      id="username"
                      value={user.username}
                      onChange={(e) => setUser({ ...user, username: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">О себе</Label>
                    <Textarea
                      id="bio"
                      value={user.bio}
                      onChange={(e) => setUser({ ...user, bio: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Статус</Label>
                    <RadioGroup
                      value={user.status}
                      onValueChange={(value) => setUser({ ...user, status: value as 'online' | 'offline' })}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="cursor-pointer">В сети</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="offline" id="offline" />
                        <Label htmlFor="offline" className="cursor-pointer">Не в сети</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="customStatus">Кастомный статус</Label>
                    <Input
                      id="customStatus"
                      value={user.customStatus || ''}
                      onChange={(e) => setUser({ ...user, customStatus: e.target.value })}
                      placeholder="🚀 Работаю над проектом"
                    />
                  </div>
                </div>
              ) : (
                user.customStatus && (
                  <div className="pt-4 text-center">
                    <p className="text-lg">{user.customStatus}</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Palette" className="h-5 w-5" />
                Настройки темы
              </CardTitle>
              <CardDescription>Выберите тему оформления</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'spektr')}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="cursor-pointer font-medium">
                        <div className="flex items-center gap-2">
                          <Icon name="Sun" className="h-4 w-4" />
                          Светлая
                        </div>
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300" />
                      <div className="w-6 h-6 rounded-full bg-purple-200" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark" className="cursor-pointer font-medium">
                        <div className="flex items-center gap-2">
                          <Icon name="Moon" className="h-4 w-4" />
                          Тёмная
                        </div>
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-700" />
                      <div className="w-6 h-6 rounded-full bg-purple-600" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="spektr" id="spektr" />
                      <Label htmlFor="spektr" className="cursor-pointer font-medium">
                        <div className="flex items-center gap-2">
                          <Icon name="Sparkles" className="h-4 w-4" />
                          Spektr
                        </div>
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600" />
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" className="h-5 w-5" />
                Информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Версия</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Платформа</span>
                <span className="font-medium">Spektr Messenger</span>
              </div>
              <div className="flex justify-between">
                <span>ID пользователя</span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
