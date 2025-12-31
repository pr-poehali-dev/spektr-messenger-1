import { useNavigate } from 'react-router-dom';
import Profile from '@/components/Profile';

export default function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Profile onClose={() => navigate('/')} />
    </div>
  );
}
