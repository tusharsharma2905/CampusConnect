'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  Percent, 
  CalendarCheck, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Plus, 
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

import { organizerService } from '@/services/organizer.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function OrganizerAnalyticsDashboard() {
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['organizer-my-events-analytics'],
    queryFn: organizerService.getMyEvents,
  });

  const events = eventsData?.items || [];

  // Aggregate Metrics
  const totalEvents = events.length;
  const publishedEvents = events.filter((e: any) => e.status === 'published' || e.status === 'completed');
  const totalRegistrations = events.reduce((acc: number, curr: any) => acc + (curr.registration_count || 0), 0);
  const totalCapacity = events.reduce((acc: number, curr: any) => acc + (curr.capacity || 0), 0);
  const capacityUtilization = totalCapacity > 0 ? (totalRegistrations / totalCapacity) * 100 : 0;

  // Chart Data: Top Events by Registration
  const eventComparisonData = events
    .slice(0, 7)
    .map((e: any) => ({
      name: e.title.length > 15 ? e.title.substring(0, 15) + '...' : e.title,
      registrations: e.registration_count || 0,
      capacity: e.capacity || 0,
    }));

  // Chart Data: Event Format Breakdown (online, offline, hybrid)
  const formatCounts: Record<string, number> = {};
  events.forEach((e: any) => {
    const type = e.event_type || 'offline';
    formatCounts[type] = (formatCounts[type] || 0) + 1;
  });

  const formatData = Object.keys(formatCounts).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: formatCounts[key],
  }));

  // Filtered Events Table
  const filteredEvents = selectedFormat === 'all' 
    ? events 
    : events.filter((e: any) => (e.event_type || 'offline') === selectedFormat);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Organizer Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Performance metrics, registration demand, and attendance trends across all your events.
          </p>
        </div>
        <Button asChild>
          <Link href="/organizer/events/create">
            <Plus className="h-4 w-4 mr-2" /> Create New Event
          </Link>
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events Hosted</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {publishedEvents.length} active or completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered participants across all events
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity Provided</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCapacity > 0 ? totalCapacity : 'Flexible'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum combined attendee seats
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/90">Capacity Fill Rate</CardTitle>
            <Percent className="h-4 w-4 text-primary-foreground/90" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{capacityUtilization.toFixed(1)}%</div>
            <p className="text-xs text-primary-foreground/80 mt-1">
              Overall seat reservation demand
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      {events.length > 0 && (
        <div className="grid gap-6 md:grid-cols-12">
          {/* Main Bar Chart: Registration Performance (8 cols) */}
          <Card className="md:col-span-8 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Event Registration Demand</CardTitle>
              <CardDescription>Signups and capacity comparison for your top events</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventComparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={40} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="registrations" name="Signups" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" name="Max Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart: Event Types Distribution (4 cols) */}
          <Card className="md:col-span-4 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Delivery Modes</CardTitle>
              <CardDescription>In-person vs online vs hybrid</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex flex-col justify-center">
              {formatData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {formatData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-sm text-muted-foreground">No events data</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events Performance Matrix Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <CardTitle className="text-lg">Events Performance Matrix</CardTitle>
            <CardDescription>Individual event metrics, signup traction, and quick links</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="bg-muted text-xs font-medium px-3 py-1.5 rounded-md border focus:outline-none"
            >
              <option value="all">All Formats</option>
              <option value="offline">In-Person Only</option>
              <option value="online">Online Only</option>
              <option value="hybrid">Hybrid Only</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              Loading analytics data...
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-muted-foreground font-medium">
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Registrations</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEvents.map((event: any) => {
                    const fillPercent = event.capacity ? Math.min(100, (event.registration_count / event.capacity) * 100) : null;
                    return (
                      <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-foreground">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.venue?.name || event.venue || 'Campus Venue'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="capitalize text-xs">
                            {event.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 capitalize text-muted-foreground">
                          {event.event_type || 'offline'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{event.registration_count}</span>
                            {fillPercent !== null && (
                              <span className="text-xs text-muted-foreground">({fillPercent.toFixed(0)}%)</span>
                            )}
                          </div>
                          {fillPercent !== null && (
                            <Progress value={fillPercent} className="h-1.5 w-24 mt-1" />
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {event.capacity || 'Unlimited'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/organizer/events/${event.id}/attendance`}>
                                Scanner
                              </Link>
                            </Button>
                            <Button variant="secondary" size="sm" asChild>
                              <Link href={`/organizer/events/${event.id}/analytics`}>
                                Deep Dive <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="font-semibold">No events found</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Create your first event to start monitoring real-time student signups and turnout metrics.
              </p>
              <Button asChild className="mt-2">
                <Link href="/organizer/events/create">Create Event</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
