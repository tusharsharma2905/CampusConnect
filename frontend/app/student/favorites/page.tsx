'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  Trash2, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  capacity?: number;
  registration_count: number;
  banner_image?: string;
  status: string;
}

export default function StudentFavoritesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: favorites = [], isLoading } = useQuery<EventItem[]>({
    queryKey: ['student-favorites'],
    queryFn: async () => {
      const res = await api.get('/favorites/me');
      return res.data;
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await api.delete(`/favorites/${eventId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Removed from favorites');
      queryClient.invalidateQueries({ queryKey: ['student-favorites'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to remove from favorites');
    },
  });

  const filteredFavorites = favorites.filter((ev) => {
    const q = search.toLowerCase();
    const categoryName = typeof ev.category === 'object' ? ev.category?.name : ev.category;
    const venueName = typeof ev.venue === 'object' ? ev.venue?.name : ev.venue;

    return (
      ev.title.toLowerCase().includes(q) ||
      (categoryName && categoryName.toLowerCase().includes(q)) ||
      (venueName && venueName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Favorite Events</h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold">
              {favorites.length} saved
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Keep track of upcoming campus hackathons, workshops, and seminars you’re interested in.
          </p>
        </div>

        <Button asChild variant="outline" className="gap-2 shrink-0">
          <Link href="/events">
            <Sparkles className="h-4 w-4 text-primary" /> Discover More Events
          </Link>
        </Button>
      </div>

      {/* Search and summary */}
      {favorites.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-xs">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter bookmarked events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            Showing {filteredFavorites.length} of {favorites.length} saved events
          </span>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-72 bg-muted/30" />
          ))}
        </div>
      ) : filteredFavorites.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 fill-rose-500/20" />
          </div>
          <h3 className="text-lg font-semibold">
            {search ? 'No matching favorites' : 'No saved events yet'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            {search
              ? 'Try modifying your search term to find saved events.'
              : 'Browse through upcoming campus events and click the heart icon on any event to bookmark it for quick access.'}
          </p>
          <Button asChild className="gap-2">
            <Link href="/events">
              Explore Events <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((ev) => {
            const categoryName = typeof ev.category === 'object' ? ev.category?.name : ev.category;
            const venueName = typeof ev.venue === 'object' ? ev.venue?.name : ev.venue;
            const isFull = ev.capacity ? ev.registration_count >= ev.capacity : false;
            const percentFilled = ev.capacity ? Math.min(100, Math.round((ev.registration_count / ev.capacity) * 100)) : 0;

            return (
              <Card key={ev.id} className="group overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                {/* Banner */}
                <div className="relative aspect-video w-full bg-muted overflow-hidden">
                  {ev.banner_image ? (
                    <img
                      src={ev.banner_image}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-500/10 via-muted to-primary/10">
                      <Heart className="h-8 w-8 text-rose-500/30" />
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    {categoryName && (
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-xs shadow-xs text-xs">
                        {categoryName}
                      </Badge>
                    )}
                  </div>

                  {/* Remove Favorite Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full shadow-md bg-white/90 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    onClick={() => removeFavoriteMutation.mutate(ev.id)}
                    title="Remove from favorites"
                    disabled={removeFavoriteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors" title={ev.title}>
                      {ev.title}
                    </h3>
                    {ev.short_description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                        {ev.short_description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{ev.start_datetime ? format(new Date(ev.start_datetime), 'MMM d, yyyy • h:mm a') : 'TBA'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{venueName || 'Online'}</span>
                    </div>

                    {ev.capacity && (
                      <div className="pt-2">
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {ev.registration_count} / {ev.capacity}
                          </span>
                          <span className={isFull ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                            {isFull ? 'Event Full' : `${ev.capacity - ev.registration_count} spots left`}
                          </span>
                        </div>
                        <Progress value={percentFilled} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Footer Link */}
                <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full gap-2" variant={isFull ? 'secondary' : 'default'}>
                    <Link href={`/events/${ev.id}`}>
                      {isFull ? 'View Event Details' : 'Register / View Event'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
