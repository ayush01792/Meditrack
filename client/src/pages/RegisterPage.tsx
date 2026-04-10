import { HeartPulse } from 'lucide-react';
import RegisterForm from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <HeartPulse size={24} className="text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Start tracking your health with MediTrack
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your health data is encrypted and secure.
        </p>
      </div>
    </div>
  );
}
