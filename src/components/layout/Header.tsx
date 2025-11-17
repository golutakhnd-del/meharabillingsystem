import { Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Scene3D from '@/components/3d/Scene3D';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate('/auth');
  };

  return (
    <header className="glass-card p-4 mb-6 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-primary">
            <Scene3D enableControls={false} />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">YUGFMSEREG</h1>
            <p className="text-muted-foreground text-sm">Smart Billing & Stock Management</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products, invoices..."
              className="pl-10 bg-surface-glass border-white/10"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user && (
            <div className="text-sm text-muted-foreground mr-2">
              {user.email}
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}