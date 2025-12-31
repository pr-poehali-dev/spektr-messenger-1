import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '@/components/ChatWindow';

export default function ChatWindowPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();

  if (!chatId) {
    navigate('/');
    return null;
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <ChatWindow chatId={chatId} onBack={() => navigate('/')} />
    </div>
  );
}
