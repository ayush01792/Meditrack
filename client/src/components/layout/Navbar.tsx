import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md">
      {/* Left: hamburger */}
      <button
        onClick={onMenuToggle}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block" />

      {/* Right: theme + user */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground',
                'ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
              aria-label="User menu"
            >
              {initials}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-48 rounded-xl border border-border bg-card p-1 shadow-lg animate-fade-in"
            >
              {/* User info */}
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-medium text-foreground">{user?.name ?? 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>

              <DropdownMenu.Item
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent cursor-pointer outline-none"
                onSelect={() => navigate('/profile')}
              >
                <User size={15} />
                Profile
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-border" />

              <DropdownMenu.Item
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 cursor-pointer outline-none"
                onSelect={handleLogout}
              >
                <LogOut size={15} />
                Log out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
