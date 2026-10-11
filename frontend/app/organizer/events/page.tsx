'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Megaphone, 
  ExternalLink, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Eye
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface EventItem {
  id: string;
  title: string;
  short_description?: string;
  category?: { name: string } | string;
  venue?: { name: string } | string;
  start_datetime: string;
  end_datetime: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'cancelled' | 'completed';
  capacity?: number;
  registration_count: number;
  banner_image?: string;
  is_featured?: boolean;
}

export default function OrganizerEventsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['organizer-my-events'],
    queryFn: async () => {
      const res = await api.get('/events/organizer/my?limit=50');
      return res.data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await api.patch(`/events/${eventId}/publish`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Event published successfully!');
      queryClient.invalidateQueries({ queryKey: ['organizer-my-events'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to publish event');
    },
  });

  const events: EventItem[] = data?.items || [];

  const filteredEvents = events.filter((ev) => {
    const venueText = typeof ev.venue === 'string' ? ev.venue : ev.venue?.name || '';
    const matchesSearch =
      (ev.title || '').toLowerCase().includes(search.toLowerCase()) ||
      venueText.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return ev.status === 'published' || ev.status === 'approved';
    if (statusFilter === 'pending') return ev.status === 'pending_approval';
    if (statusFilter === 'draft') return ev.status === 'draft';
    return ev.status === statusFilter;
  });

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'published').length;
  const pendingEvents = events.filter((e) => e.status === 'pending_approval').length;
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registration_count || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">Published & Live</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-medium">Approved</Badge>;
      case 'pending_approval':
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Pending Approval</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Needs Revision</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-slate-100 text-slate-700">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and monitor all events organized by your club or department.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="gap-2 shadow-sm">
            <Link href="/organizer/events/create">
              <Plus className="h-4 w-4" /> Create New Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Managed under your profile</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active & Live</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{publishedEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Visible on student portal</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting admin review</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered participants</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-card p-4 rounded-xl border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'active', label: 'Active & Approved' },
            { id: 'pending', label: 'Pending' },
            { id: 'draft', label: 'Drafts' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={statusFilter === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(tab.id)}
              className="text-xs capitalize"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse h-64 bg-muted/40" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">No events found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            {search || statusFilter !== 'all'
              ? 'No events match your search filters. Try clearing filters or searching for something else.'
              : 'You haven’t created any events yet. Get started by organizing your first campus hackathon, workshop, or seminar!'}
          </p>
          <Button asChild>
            <Link href="/organizer/events/create">
              <Plus className="h-4 w-4 mr-2" /> Create First Event
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((ev) => {
            const categoryName = typeof ev.category === 'object' ? ev.category?.name : ev.category;
            const venueName = typeof ev.venue === 'object' ? ev.venue?.name : ev.venue;
            const percentFilled = ev.capacity ? Math.min(100, Math.round((ev.registration_count / ev.capacity) * 100)) : 0;

            return (
              <Card key={ev.id} className="overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                {/* Event Image Banner */}
                <div className="relative aspect-video w-full bg-muted overflow-hidden">
                  {ev.banner_image ? (
                    <img
                      src={ev.banner_image}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-primary/5 p-4 text-center">
                      <Sparkles className="h-8 w-8 text-primary/40 mb-2" />
                      <span className="text-xs font-medium text-muted-foreground">CampusConnect Event</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {categoryName && (
                      <Badge variant="secondary" className="backdrop-blur-md bg-background/90 text-xs shadow-xs">
                        {categoryName}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(ev.status)}
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors" title={ev.title}>
                    {ev.title}
                  </h3>

                  {ev.short_description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {ev.short_description}
                    </p>
                  )}

                  <div className="space-y-2 text-xs text-muted-foreground mt-auto pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{ev.start_datetime ? format(new Date(ev.start_datetime), 'MMM d, yyyy • h:mm a') : 'TBA'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{venueName || 'Online'}</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {ev.registration_count} registered
                        </span>
                        {ev.capacity && (
                          <span className="text-muted-foreground font-medium">
                            {ev.capacity - ev.registration_count} spots left
                          </span>
                        )}
                      </div>
                      {ev.capacity && (
                        <Progress value={percentFilled} className="h-1.5" />
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Action Buttons */}
                <div className="p-4 pt-0 bg-muted/10 border-t flex flex-wrap items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" asChild className="h-8 px-2.5 text-xs gap-1.5">
                      <Link href={`/events/${ev.id}`}>
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="h-8 px-2.5 text-xs gap-1.5">
                      <Link href={`/organizer/announcements?eventId=${ev.id}`}>
                        <Megaphone className="h-3.5 w-3.5" /> Announce
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="h-8 px-2.5 text-xs gap-1.5" title="Scan QR Attendance">
                      <Link href={`/organizer/events/${ev.id}/attendance`}>
                        <QrCode className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>

                  {ev.status === 'approved' && (
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => publishMutation.mutate(ev.id)}
                      disabled={publishMutation.isPending}
                    >
                      Publish
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
