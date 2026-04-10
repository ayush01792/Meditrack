import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; positive: boolean };
  loading?: boolean;
}

export default function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  trend,
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
            {trend && (
              <p
                className={cn(
                  'text-xs font-medium',
                  trend.positive ? 'text-green-500' : 'text-destructive'
                )}
              >
                {trend.positive ? '▲' : '▼'} {Math.abs(trend.value)}% vs last week
              </p>
            )}
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconBg)}>
            <Icon size={18} className={iconColor} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
