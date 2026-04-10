import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { VitalEntry, VitalType } from '@/types';
import { getVitalNormalRange } from '@/lib/utils';

interface Props {
  entries: VitalEntry[];
  type: VitalType;
  loading?: boolean;
}

const TYPE_CONFIG: Record<VitalType, { title: string; color: string; unit: string }> = {
  blood_sugar: { title: 'Blood Sugar', color: '#3b82f6', unit: 'mg/dL' },
  blood_pressure: { title: 'Blood Pressure', color: '#8b5cf6', unit: 'mmHg' },
  weight: { title: 'Weight', color: '#10b981', unit: 'kg' },
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
    fontSize: 12,
    color: 'hsl(var(--foreground))',
  },
};

export default function VitalsChart({ entries, type, loading }: Props) {
  const config = TYPE_CONFIG[type];
  const normalRange = getVitalNormalRange(type);

  const chartData = [...entries]
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .map((e) => ({
      date: format(new Date(e.loggedAt), 'MMM dd'),
      value: e.value,
      systolic: e.systolic,
      diastolic: e.diastolic,
    }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{config.title} Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-52 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title} Trend</CardTitle>
        <p className="text-sm text-muted-foreground">Last {entries.length} readings</p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
            No readings recorded yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                unit={` ${config.unit}`}
                width={60}
              />
              <Tooltip {...TOOLTIP_STYLE} />

              {/* Normal range reference lines */}
              {normalRange && (
                <>
                  <ReferenceLine
                    y={normalRange.max}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{ value: 'Max', fontSize: 10, fill: '#ef4444', position: 'right' }}
                  />
                  <ReferenceLine
                    y={normalRange.min}
                    stroke="#22c55e"
                    strokeDasharray="4 4"
                    label={{ value: 'Min', fontSize: 10, fill: '#22c55e', position: 'right' }}
                  />
                </>
              )}

              {type === 'blood_pressure' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#8b5cf6' }}
                    activeDot={{ r: 5 }}
                    name="Systolic"
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#ec4899' }}
                    activeDot={{ r: 5 }}
                    name="Diastolic"
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={config.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: config.color }}
                  activeDot={{ r: 5 }}
                  name={config.title}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
