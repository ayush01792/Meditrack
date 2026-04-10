import { useState } from 'react';
import { Plus, Trash2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import VitalsChart from '@/features/vitals/components/VitalsChart';
import VitalForm from '@/features/vitals/components/VitalForm';
import { useVitals, useDeleteVital } from '@/features/vitals/hooks/useVitals';
import { formatDate, formatTime, getVitalUnit } from '@/lib/utils';
import type { VitalType } from '@/types';

const TABS: { label: string; value: VitalType }[] = [
  { label: 'Blood Sugar', value: 'blood_sugar' },
  { label: 'Blood Pressure', value: 'blood_pressure' },
  { label: 'Weight', value: 'weight' },
];

export default function VitalsPage() {
  const [activeTab, setActiveTab] = useState<VitalType>('blood_sugar');
  const [logOpen, setLogOpen] = useState(false);

  const { data: entries = [], isLoading } = useVitals(activeTab);
  const { mutate: deleteEntry } = useDeleteVital();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vitals</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track your blood sugar, pressure, and weight
          </p>
        </div>
        <Dialog open={logOpen} onOpenChange={setLogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} /> Log Vital
            </Button>
          </DialogTrigger>
          <DialogContent title="Log a Vital" description="Enter your latest measurement below.">
            <VitalForm onSuccess={() => setLogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <VitalsChart entries={entries} type={activeTab} loading={isLoading} />

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Activity size={28} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No readings logged yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Time</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Reading</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Notes</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {[...entries]
                    .sort(
                      (a, b) =>
                        new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
                    )
                    .map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors"
                      >
                        <td className="py-3 text-foreground">{formatDate(entry.loggedAt)}</td>
                        <td className="py-3 text-muted-foreground">{formatTime(entry.loggedAt)}</td>
                        <td className="py-3">
                          <Badge variant="secondary">
                            {activeTab === 'blood_pressure'
                              ? `${entry.systolic}/${entry.diastolic} ${getVitalUnit(activeTab)}`
                              : `${entry.value} ${getVitalUnit(activeTab)}`}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground text-xs max-w-[180px] truncate">
                          {entry.notes ?? '—'}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
