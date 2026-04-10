import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  HeartPulse, Pill, Activity, CheckCircle, XCircle, Clock, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatFrequency } from '@/lib/utils';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

interface SharedReport {
  patientName: string;
  adherence: {
    taken: number;
    missed: number;
    snoozed: number;
    total: number;
    adherenceRate: number;
  };
  activeMedicines: {
    name: string;
    dosage: string;
    form: string;
    frequency: string;
    times: string[];
  }[];
  recentVitals: {
    type: string;
    value: number | null;
    systolic: number | null;
    diastolic: number | null;
    unit: string;
    loggedAt: string;
  }[];
  expiresAt: string;
}

async function fetchSharedReport(token: string): Promise<SharedReport> {
  const { data } = await axios.get(`${BASE_URL}/reports/shared/${token}`);
  return data.data;
}

export default function SharedReportPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shared-report', token],
    queryFn: () => fetchSharedReport(token!),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <AlertCircle size={40} className="text-destructive" />
        <h1 className="text-xl font-bold text-foreground">Link Expired or Invalid</h1>
        <p className="text-sm text-muted-foreground">
          This shared report link is no longer valid. Ask the patient to generate a new one.
        </p>
      </div>
    );
  }

  const rateColor =
    data.adherence.adherenceRate >= 80
      ? 'text-green-500'
      : data.adherence.adherenceRate >= 50
      ? 'text-yellow-500'
      : 'text-destructive';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <HeartPulse size={22} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Shared Health Report</p>
            <h1 className="text-xl font-bold text-foreground">{data.patientName}</h1>
            <p className="text-xs text-muted-foreground">
              Expires {formatDate(data.expiresAt)}
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">Read Only</Badge>
        </div>

        {/* Adherence */}
        <Card>
          <CardHeader>
            <CardTitle>Medication Adherence (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-4xl font-bold ${rateColor}`}>
                  {data.adherence.adherenceRate}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Adherence Rate</p>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-green-500" />
                  <span className="text-muted-foreground">Taken:</span>
                  <span className="font-semibold text-foreground">{data.adherence.taken}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle size={15} className="text-destructive" />
                  <span className="text-muted-foreground">Missed:</span>
                  <span className="font-semibold text-foreground">{data.adherence.missed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-yellow-500" />
                  <span className="text-muted-foreground">Snoozed:</span>
                  <span className="font-semibold text-foreground">{data.adherence.snoozed}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Medicines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill size={17} className="text-primary" /> Active Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.activeMedicines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active medicines.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {data.activeMedicines.map((med, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{med.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {med.dosage} · {med.form} · {formatFrequency(med.frequency)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Times: {med.times.join(', ')}
                      </p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={17} className="text-primary" /> Recent Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentVitals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No vitals logged.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">Type</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Reading</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentVitals.map((v, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2 capitalize text-foreground">
                          {v.type.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2 font-medium text-foreground">
                          {v.type === 'blood_pressure'
                            ? `${v.systolic}/${v.diastolic} ${v.unit}`
                            : `${v.value} ${v.unit}`}
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {formatDate(v.loggedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Generated by MediTrack · This report is read-only and for reference purposes only.
        </p>
      </div>
    </div>
  );
}
