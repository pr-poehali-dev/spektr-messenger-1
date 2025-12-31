import { useState } from 'react';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import Profile from '@/components/Profile';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function Index() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <ChatList 
          onSelectChat={setSelectedChat} 
          selectedChat={selectedChat}
          onShowProfile={() => setShowProfile(true)}
        />
        
        {showProfile ? (
          <Profile onClose={() => setShowProfile(false)} />
        ) : (
          <ChatWindow chatId={selectedChat} />
        )}
      </div>
    </ThemeProvider>
  );
}