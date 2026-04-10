import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Activity,
  Bell,
  FileText,
  X,
  HeartPulse,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/medicines', label: 'Medicines', icon: Pill },
  { to: '/vitals', label: 'Vitals', icon: Activity },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/medical-history', label: 'Medical History', icon: ClipboardList },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <HeartPulse size={16} className="text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">MediTrack</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Main Menu
          </p>
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )
                  }
                >
                  <Icon size={17} className="shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <p className="text-center text-[10px] text-muted-foreground">
            Medicine Reminder & Health Tracker
          </p>
        </div>
      </aside>
    </>
  );
}
