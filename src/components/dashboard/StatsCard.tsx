import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  color?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "#06b6d4" 
}: StatsCardProps) {
  return (
    <Card className="glass-card border-white/10 hover:shadow-glow transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <div className="flex items-baseline space-x-2 mt-2">
              <div className="text-2xl font-bold text-foreground">{value}</div>
              {trend && (
                <span className={`text-sm font-medium ${
                  trend.positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trend.positive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div 
            className="p-3 rounded-lg group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}