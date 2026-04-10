import { Pill, CheckCircle, XCircle, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import StatCard from '@/features/dashboard/components/StatCard';
import AdherenceChart from '@/features/dashboard/components/AdherenceChart';
import TodayReminders from '@/features/dashboard/components/TodayReminders';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useDashboard();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's an overview of your health today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Medicines"
          value={data?.activeMedicines ?? 0}
          subtext="Currently scheduled"
          icon={Pill}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
          loading={isLoading}
        />
        <StatCard
          label="Doses Taken"
          value={data?.adherence.taken ?? 0}
          subtext="This week"
          icon={CheckCircle}
          iconColor="text-green-500"
          iconBg="bg-green-500/10"
          trend={{ value: 5, positive: true }}
          loading={isLoading}
        />
        <StatCard
          label="Doses Missed"
          value={data?.adherence.missed ?? 0}
          subtext="This week"
          icon={XCircle}
          iconColor="text-red-500"
          iconBg="bg-red-500/10"
          trend={{ value: 2, positive: false }}
          loading={isLoading}
        />
        <StatCard
          label="Adherence Rate"
          value={`${data?.adherence.adherenceRate ?? 0}%`}
          subtext="Last 7 days"
          icon={Activity}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
          loading={isLoading}
        />
      </div>

      {/* Charts + Reminders */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdherenceChart stats={data?.adherence} loading={isLoading} />
        <TodayReminders reminders={data?.todayReminders} loading={isLoading} />
      </div>
    </div>
  );
}
