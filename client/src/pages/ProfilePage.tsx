import { User, Mail, Calendar, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Your account details</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {initials}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {[
            { icon: User, label: 'Full Name', value: user?.name ?? '—' },
            { icon: Mail, label: 'Email', value: user?.email ?? '—' },
            { icon: Calendar, label: 'Member Since', value: user?.createdAt ? formatDate(user.createdAt) : '—' },
            { icon: Shield, label: 'Account Type', value: 'Standard' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
