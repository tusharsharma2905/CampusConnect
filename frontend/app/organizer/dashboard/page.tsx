'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, CalendarCheck, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { organizerService } from '@/services/organizer.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['my-created-events'],
    queryFn: organizerService.getMyEvents,
  });

  const myEvents = eventsData?.items?.filter((e: any) => e.organizer_id === user?.id) || [];
  const activeEvents = myEvents.filter((e: any) => e.status === 'published');
  
  const totalRegistrations = myEvents.reduce((acc: number, curr: any) => acc + curr.registration_count, 0);

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Organizer'}
          </h1>
          <p className="text-muted-foreground mt-1">Here is what's happening with your events.</p>
        </div>
        <Button asChild>
          <Link href="/organizer/events/create">Create Event</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myEvents.length}</div>
            <p className="text-xs text-muted-foreground">{activeEvents.length} active currently</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--%</div>
            <p className="text-xs text-muted-foreground">Historical data pending</p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">Action Needed</CardTitle>
            <Clock className="h-4 w-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-primary-foreground/80">Pending approvals</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Your Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : myEvents.length > 0 ? (
              <div className="space-y-4">
                {myEvents.slice(0, 4).map((event: any) => (
                  <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.status} • {event.registration_count} registered
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/organizer/events/${event.id}/attendance`}>Scanner</Link>
                      </Button>
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/organizer/events/${event.id}/analytics`}>Stats</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't created any events yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
