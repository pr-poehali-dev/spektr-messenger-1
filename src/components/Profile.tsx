import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ProfileProps {
  onClose: () => void;
}

const themes = [
  { value: 'light', label: 'Светлая', icon: 'Sun' },
  { value: 'dark', label: 'Тёмная', icon: 'Moon' },
  { value: 'spektr', label: 'Spektr', icon: 'Sparkles' },
  { value: 'ocean', label: 'Океан', icon: 'Waves' },
  { value: 'sunset', label: 'Закат', icon: 'Sunrise' },
  { value: 'forest', label: 'Лес', icon: 'Trees' },
  { value: 'rose', label: 'Роза', icon: 'Flower2' },
] as const;

export default function Profile({ onClose }: ProfileProps) {
  const navigate = useNavigate();
  const { user, updateUser, changePassword, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [customStatus, setCustomStatus] = useState(user?.customStatus || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSave = () => {
    if (!user) return;

    updateUser({
      name,
      bio,
      customStatus,
      avatar: avatarUrl,
    });

    if (oldPassword && newPassword) {
      const success = changePassword(oldPassword, newPassword);
      if (success) {
        setOldPassword('');
        setNewPassword('');
        setPasswordError('');
      } else {
        setPasswordError('Неверный старый пароль');
        return;
      }
    }

    setIsEditing(false);
  };

  const handleLogout = () => {
    if (confirm('Выйти из аккаунта?')) {
      logout();
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col bg-background h-screen">
      <div className="h-16 border-b border-border px-4 md:px-6 flex items-center justify-between bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h2 className="text-lg font-semibold">Профиль</h2>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <Icon name="X" size={16} className="mr-2" />
              Отмена
            </Button>
            <Button onClick={handleSave} className="gradient-bg">
              <Icon name="Check" size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Icon name="Edit" size={16} className="mr-2" />
            Редактировать
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                  <AvatarImage src={isEditing ? avatarUrl : user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="gradient-text text-2xl">
                {isEditing ? name : user.name}
              </CardTitle>
              <CardDescription>@{user.username}</CardDescription>
              {(isEditing ? customStatus : user.customStatus) && (
                <p className="text-sm text-muted-foreground mt-2">
                  {isEditing ? customStatus : user.customStatus}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="default" className="gradient-bg">
                  <div className="w-2 h-2 rounded-full mr-2 bg-green-400" />
                  В сети
                </Badge>
              </div>

              {isEditing && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Имя</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ваше имя"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avatar">Фото профиля (URL)</Label>
                      <Input
                        id="avatar"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">О себе</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Расскажите о себе"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Статус</Label>
                      <Input
                        id="status"
                        value={customStatus}
                        onChange={(e) => setCustomStatus(e.target.value)}
                        placeholder="Ваш статус"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Lock" size={20} />
                  Сменить пароль
                </CardTitle>
                <CardDescription>Оставьте пустым, если не хотите менять</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old-password">Старый пароль</Label>
                  <div className="relative">
                    <Input
                      id="old-password"
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Введите старый пароль"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name={showOldPassword ? 'EyeOff' : 'Eye'} size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Введите новый пароль"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name={showNewPassword ? 'EyeOff' : 'Eye'} size={18} />
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {passwordError}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Palette" size={20} />
                Тема оформления
              </CardTitle>
              <CardDescription>Выберите цветовую схему приложения</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={theme} onValueChange={(value: any) => setTheme(value)}>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((t) => (
                    <Label
                      key={t.value}
                      htmlFor={t.value}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent',
                        theme === t.value && 'border-primary bg-accent'
                      )}
                    >
                      <RadioGroupItem value={t.value} id={t.value} />
                      <Icon name={t.icon as any} size={20} />
                      <span className="font-medium">{t.label}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Icon name="LogOut" size={20} />
                Выход из аккаунта
              </CardTitle>
              <CardDescription>Вы всегда можете вернуться</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
