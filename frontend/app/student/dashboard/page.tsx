'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, CalendarDays, Award, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { registrationService } from '@/services/registration.service';
import { aiService } from '@/services/ai.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const { data: registrations, isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: registrationService.getMyRegistrations,
  });

  const activeRegistrations = registrations?.filter(r => r.status === 'registered') || [];
  const completedEvents = registrations?.filter(r => r.status === 'attended') || [];

  const { data: recommendations, isLoading: isRecsLoading } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => aiService.getSuggestions(['Technology', 'Career'], completedEvents.map(e => e.event?.title || 'Event')),
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Good morning, {user?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Discover what's happening on campus.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Events</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRegistrations.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming in your schedule</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedEvents.length}</div>
            <p className="text-xs text-muted-foreground">Events attended</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Earned achievements</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Registrations</CardTitle>
            <CardDescription>Your registered events that are coming up soon.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : activeRegistrations.length > 0 ? (
              <div className="space-y-4">
                {activeRegistrations.slice(0, 3).map(reg => (
                  <div key={reg.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="bg-primary/10 text-primary p-3 rounded-md">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium truncate">{reg.event?.title || 'Unknown Event'}</p>
                      <p className="text-sm text-muted-foreground">Registration ID: {reg.registration_id}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/events/${reg.event_id}`}>View</Link>
                    </Button>
                  </div>
                ))}
                <Button variant="link" className="w-full" asChild>
                  <Link href="/student/registrations">View all registrations</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No upcoming registrations.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/events">Explore Events</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>Events tailored to your interests.</CardDescription>
          </CardHeader>
          <CardContent>
            {isRecsLoading ? (
              <div className="text-center py-10 border rounded-lg bg-muted/20 border-dashed">
                <SparklesIcon className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
                <h3 className="font-medium mb-1">AI Engine Generating...</h3>
                <p className="text-sm text-muted-foreground px-4">
                  We're analyzing your profile and department to find the best events for you.
                </p>
              </div>
            ) : recommendations ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground italic mb-2">"{recommendations.reasoning}"</p>
                {recommendations.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                    <SparklesIcon className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border rounded-lg bg-muted/20 border-dashed">
                <p className="text-muted-foreground">Unable to fetch recommendations.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
