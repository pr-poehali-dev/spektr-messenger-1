import { useNavigate } from 'react-router-dom';
import ChatList from '@/components/ChatList';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden bg-background">
      <ChatList 
        onSelectChat={(chatId) => navigate(`/chat/${chatId}`)} 
        selectedChat={null}
        onShowProfile={() => navigate('/profile')}
      />
    </div>
  );
}