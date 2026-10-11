'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Megaphone, 
  Send, 
  Calendar, 
  Clock, 
  Bell, 
  Sparkles, 
  Search, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AnnouncementItem {
  id: string;
  event_id: string;
  title: string;
  message: string;
  created_at: string;
  event_title?: string;
}

interface EventItem {
  id: string;
  title: string;
  status: string;
}

function AnnouncementsContent() {
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get('eventId') || '';
  const queryClient = useQueryClient();

  const [selectedEventId, setSelectedEventId] = useState<string>(preselectedEventId);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch organizer's events for dropdown
  const { data: eventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ['organizer-my-events-dropdown'],
    queryFn: async () => {
      const res = await api.get('/events/organizer/my?limit=50');
      return res.data;
    },
  });

  const events: EventItem[] = eventsData?.items || [];

  // If preselectedEventId changes or loads, sync state
  useEffect(() => {
    if (preselectedEventId && !selectedEventId) {
      setSelectedEventId(preselectedEventId);
    } else if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [preselectedEventId, events, selectedEventId]);

  // Fetch past announcements
  const { data: announcements = [], isLoading: loadingAnnouncements } = useQuery<AnnouncementItem[]>({
    queryKey: ['organizer-all-announcements'],
    queryFn: async () => {
      const res = await api.get('/events/organizer/announcements/all');
      return res.data;
    },
  });

  // Create announcement mutation
  const broadcastMutation = useMutation({
    mutationFn: async (payload: { eventId: string; title: string; message: string }) => {
      const res = await api.post(`/events/${payload.eventId}/announcements`, {
        title: payload.title,
        message: payload.message,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Announcement broadcasted successfully to all participants!');
      setTitle('');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['organizer-all-announcements'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to broadcast announcement');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      toast.error('Please select an event to announce for');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter an announcement title');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter the announcement message');
      return;
    }

    broadcastMutation.mutate({
      eventId: selectedEventId,
      title: title.trim(),
      message: message.trim(),
    });
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.message.toLowerCase().includes(q) ||
      (a.event_title && a.event_title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Event Announcements</h1>
        <p className="text-muted-foreground mt-1">
          Broadcast instant updates, schedule changes, and instructions to registered attendees.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Create Announcement Form */}
        <div className="lg:col-span-5">
          <Card className="sticky top-20 shadow-sm border-primary/20">
            <CardHeader className="bg-primary/5 border-b rounded-t-xl pb-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                <Megaphone className="h-5 w-5" />
                <span>New Announcement</span>
              </div>
              <CardDescription>
                Notify participants registered for your event.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-select">Target Event</Label>
                  {loadingEvents ? (
                    <div className="h-10 bg-muted animate-pulse rounded-md" />
                  ) : events.length === 0 ? (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-md border border-amber-200">
                      You haven’t created any events yet. Create an event first to post announcements.
                    </div>
                  ) : (
                    <select
                      id="event-select"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} ({ev.status})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Headline / Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Schedule Change, Room Assignment..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={broadcastMutation.isPending}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Announcement Content</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Provide full details, guidelines, venue directions, or links for attendees..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={broadcastMutation.isPending}
                    required
                  />
                </div>

                <div className="bg-muted/40 p-3 rounded-lg border text-xs text-muted-foreground flex items-start gap-2">
                  <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    This announcement will be permanently logged on the event page and visible to all registered participants.
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 shadow-xs"
                  disabled={broadcastMutation.isPending || events.length === 0}
                >
                  {broadcastMutation.isPending ? (
                    'Broadcasting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Broadcast to Attendees
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History of Announcements */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold">Past Announcements</h2>
              <p className="text-xs text-muted-foreground">
                {announcements.length} announcement{announcements.length === 1 ? '' : 's'} broadcasted
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                className="pl-8 text-xs h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loadingAnnouncements ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse h-32 bg-muted/30" />
              ))}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <Card className="border-dashed p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Megaphone className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-base">No announcements yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                {searchTerm
                  ? 'No announcements match your search query.'
                  : 'Broadcast your first announcement using the form on the left to keep your participants in sync!'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((ann) => (
                <Card key={ann.id} className="overflow-hidden hover:border-primary/40 transition-colors shadow-xs">
                  <CardHeader className="p-4 pb-2 bg-muted/20 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-background text-xs font-medium text-primary">
                          {ann.event_title || 'Campus Event'}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ann.created_at ? format(new Date(ann.created_at), 'MMM d, yyyy • h:mm a') : 'Recently'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-base text-foreground">{ann.title}</h3>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-emerald-600 bg-emerald-50 border-emerald-200">
                      Delivered
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {ann.message}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrganizerAnnouncementsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading announcements...</div>}>
      <AnnouncementsContent />
    </Suspense>
  );
}
