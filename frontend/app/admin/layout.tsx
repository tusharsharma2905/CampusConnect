'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Settings,
  ShieldCheck,
  UserCircle,
  ShieldAlert,
  LogOut,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Event Approvals', href: '/admin/events', icon: CalendarDays },
  { title: 'User Management', href: '/admin/users', icon: Users },
  { title: 'Platform Settings', href: '/admin/settings', icon: Settings },
  { title: 'Admin Profile', href: '/admin/profile', icon: UserCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Guard: if logged in as non-admin (e.g. organizer or student)
  if (user && user.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/20 p-4">
        <div className="max-w-md w-full bg-card border rounded-2xl p-8 text-center shadow-lg space-y-5">
          <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Admin Privileges Required</h2>
            <p className="text-muted-foreground text-sm mt-2">
              You are currently signed in as <strong className="text-foreground">{user.email}</strong> with the{' '}
              <Badge variant="outline" className="capitalize">{user.role}</Badge> role.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Approving events and modifying platform settings requires an Administrator account (e.g. <code>admin@campusconnect.com</code>).
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full gap-2"
              onClick={async () => {
                await logout();
                router.push('/auth/login');
              }}
            >
              <LogOut className="w-4 h-4" /> Sign In as Admin
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (user.role === 'organizer') router.push('/organizer/dashboard');
                else router.push('/student/dashboard');
              }}
            >
              Back to {user.role === 'organizer' ? 'Organizer' : 'Student'} Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex-shrink-0 flex flex-col">
        <div className="h-14 flex items-center px-6 border-b font-bold text-lg text-primary gap-2">
          <ShieldCheck className="h-5 w-5" /> Admin Panel
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? '' : 'opacity-70'}`} />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
        {user && (
          <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
            <div className="truncate text-xs">
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              title="Sign Out"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-14 border-b flex items-center justify-between px-6 bg-background sticky top-0 z-10 shadow-sm">
          <h2 className="font-semibold capitalize">
            {pathname.split('/').pop()?.replace('-', ' ') || 'Admin Dashboard'}
          </h2>
          {user && (
            <Badge variant="outline" className="gap-1 bg-primary/5 text-primary border-primary/20 text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              {user.email} (Admin)
            </Badge>
          )}
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
