import { Search, Bell, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Scene3D from '@/components/3d/Scene3D';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  return (
    <header className="glass-card p-4 mb-6 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-primary">
            <Scene3D enableControls={false} />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">BillCraft Pro</h1>
            <p className="text-muted-foreground text-sm">Modern Billing & Inventory</p>
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full text-xs"></span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}