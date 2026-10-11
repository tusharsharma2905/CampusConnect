'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  CalendarCheck, 
  CalendarDays, 
  Heart, 
  Award, 
  Bell, 
  UserCircle 
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { title: 'Discover Events', href: '/events', icon: Search },
  { title: 'My Registrations', href: '/student/registrations', icon: CalendarCheck },
  { title: 'Calendar', href: '/student/calendar', icon: CalendarDays },
  { title: 'Favorites', href: '/student/favorites', icon: Heart },
  { title: 'Certificates', href: '/student/certificates', icon: Award },
  { title: 'Notifications', href: '/student/notifications', icon: Bell },
  { title: 'Profile', href: '/student/profile', icon: UserCircle },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/20 flex-shrink-0 flex flex-col">
        <div className="h-14 flex items-center px-6 border-b font-bold text-lg text-primary">
          CampusConnect
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
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
        <div className="h-14 border-b flex items-center px-6 bg-background sticky top-0 z-10">
          <h2 className="font-semibold capitalize">
            {pathname.split('/').pop()?.replace('-', ' ') || 'Student Portal'}
          </h2>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
