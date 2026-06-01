import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/UserAvatar';
import UserProfile from '@/components/UserProfile';

const funnelLogo = '/revoquest%20logo.png';

interface FunnelLMSLayoutProps {
  children: React.ReactNode;
  /** Current area for nav highlight (unused; kept for API compatibility) */
  area?: 'learner' | 'admin' | 'instructor';
}

export function FunnelLMSLayout({ children }: FunnelLMSLayoutProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout('/funnel/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/funnel" className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 sm:h-12 sm:w-12">
                <img src={funnelLogo} alt="Revo Learn" className="h-full w-full object-contain" />
              </span>
              <span className="text-lg font-bold text-white sm:text-xl">Revo Learn</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-2 text-slate-300 text-sm hover:text-white hover:bg-slate-800/50 rounded-lg px-2 py-1.5 transition-colors"
                aria-label="View profile"
              >
                <UserAvatar user={user} size="sm" />
                <span className="hidden sm:inline font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="hidden sm:inline text-slate-500 capitalize">({user?.role})</span>
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-1" /> Log out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>

      {profileOpen && (
        <UserProfile isModal onClose={() => setProfileOpen(false)} />
      )}
    </div>
  );
}
