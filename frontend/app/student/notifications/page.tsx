'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Bell, 
  CheckCheck, 
  Check, 
  ExternalLink, 
  Award, 
  Megaphone, 
  Calendar, 
  Sparkles,
  Inbox,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function StudentNotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const { data: notifications = [], isLoading } = useQuery<NotificationItem[]>({
    queryKey: ['student-notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications/me');
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch('/notifications/read-all');
      return res.data;
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['student-notifications'] });
    },
    onError: () => {
      toast.error('Failed to mark all as read');
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const getNotificationIcon = (type?: string, title?: string) => {
    const text = ((type || '') + ' ' + (title || '')).toLowerCase();
    if (text.includes('certificate') || text.includes('award')) {
      return <Award className="h-5 w-5 text-amber-500" />;
    }
    if (text.includes('announce') || text.includes('broadcast')) {
      return <Megaphone className="h-5 w-5 text-purple-500" />;
    }
    if (text.includes('event') || text.includes('register') || text.includes('session')) {
      return <Calendar className="h-5 w-5 text-blue-500" />;
    }
    return <Bell className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground font-semibold px-2.5 py-0.5">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Stay updated with your event registrations, announcements, and certificates.
          </p>
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="gap-2 shrink-0"
          >
            <CheckCheck className="h-4 w-4 text-primary" /> Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 border-b pb-3">
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'read', label: `Read (${notifications.length - unreadCount})` },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={filter === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(tab.id as any)}
            className="text-xs rounded-full px-4"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="animate-pulse h-20 bg-muted/30" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {filter === 'unread' ? "You're all caught up!" : 'No notifications'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
            {filter === 'unread'
              ? 'There are no unread notifications right now. Check back later!'
              : 'When event organizers post updates, send reminders, or issue certificates, they will appear here.'}
          </p>
          <Button variant="outline" asChild>
            <Link href="/events">Explore Campus Events</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`transition-all duration-200 border ${
                notif.is_read
                  ? 'bg-card opacity-85'
                  : 'bg-primary/5 border-primary/30 shadow-xs'
              }`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    notif.is_read ? 'bg-muted' : 'bg-primary/10 shadow-xs'
                  }`}
                >
                  {getNotificationIcon(notif.type, notif.title)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className={`text-sm ${notif.is_read ? 'font-medium' : 'font-semibold text-foreground'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {notif.created_at ? format(new Date(notif.created_at), 'MMM d, h:mm a') : 'Recently'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    {notif.link && (
                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="h-auto p-0 text-xs text-primary font-medium gap-1"
                      >
                        <Link href={notif.link}>
                          View details <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}

                    {!notif.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markReadMutation.mutate(notif.id)}
                        className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                      >
                        <Check className="h-3 w-3" /> Mark as read
                      </Button>
                    )}
                  </div>
                </div>

                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 self-center" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
