import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AdherenceStats } from '@/types';

interface Props {
  stats?: AdherenceStats;
  loading?: boolean;
}

const COLORS = {
  taken: '#22c55e',
  missed: '#ef4444',
  snoozed: '#f59e0b',
};

export default function AdherenceChart({ stats, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Adherence Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: 'Taken', value: stats?.taken ?? 0, color: COLORS.taken },
    { name: 'Missed', value: stats?.missed ?? 0, color: COLORS.missed },
    { name: 'Snoozed', value: stats?.snoozed ?? 0, color: COLORS.snoozed },
  ].filter((d) => d.value > 0);

  const rate = stats?.adherenceRate ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adherence Overview</CardTitle>
        <p className="text-sm text-muted-foreground">Last 7 days</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Donut chart */}
          <div className="relative h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.length ? data : [{ name: 'None', value: 1, color: '#e2e8f0' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={66}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground">{rate}%</span>
              <span className="text-[10px] text-muted-foreground">Rate</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3">
            {[
              { label: 'Taken', value: stats?.taken ?? 0, color: COLORS.taken },
              { label: 'Missed', value: stats?.missed ?? 0, color: COLORS.missed },
              { label: 'Snoozed', value: stats?.snoozed ?? 0, color: COLORS.snoozed },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="ml-auto text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
