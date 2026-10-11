'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  ListOrdered, 
  BarChart3, 
  Megaphone,
  ScanLine,
  UserCircle
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/organizer/dashboard', icon: LayoutDashboard },
  { title: 'My Events', href: '/organizer/events', icon: ListOrdered },
  { title: 'Create Event', href: '/organizer/events/create', icon: CalendarPlus },
  { title: 'QR Scanner', href: '/organizer/attendance', icon: ScanLine },
  { title: 'Announcements', href: '/organizer/announcements', icon: Megaphone },
  { title: 'Analytics', href: '/organizer/analytics', icon: BarChart3 },
  { title: 'Profile', href: '/organizer/profile', icon: UserCircle },
];

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/10 flex-shrink-0 flex flex-col">
        <div className="h-14 flex items-center px-6 border-b font-bold text-lg text-primary">
          Organizer Portal
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href) && (item.href !== '/organizer/events' || pathname === '/organizer/events');
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-14 border-b flex items-center px-6 bg-background sticky top-0 z-10 shadow-sm">
          <h2 className="font-semibold capitalize">
            {pathname.split('/').pop()?.replace('-', ' ') || 'Organizer Portal'}
          </h2>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
