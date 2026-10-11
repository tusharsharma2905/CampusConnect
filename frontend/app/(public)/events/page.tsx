'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { eventService } from '@/services/event.service';
import { EventCard } from '@/components/events/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]); // Note: In a real app we'd use a proper useDebounce hook

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', { page, search: debouncedSearch }],
    queryFn: () => eventService.getEvents({ page, limit: 12, search: debouncedSearch }),
  });

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Events</h1>
          <p className="text-muted-foreground mt-1">Find and register for upcoming events on campus.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-destructive">
          <p>Failed to load events. Please try again later.</p>
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search filters.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setSearch('')}
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.items.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                image={event.banner_image}
                category={event.category?.name || 'General'}
                date={event.start_datetime}
                venue={event.venue?.name}
                registrations={event.registration_count}
                capacity={event.capacity}
                status={event.status}
                featured={event.is_featured}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground font-medium px-4">
                Page {page} of {data.total_pages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
