'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  ExternalLink,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO
} from 'date-fns';

import { registrationService } from '@/services/registration.service';
import { eventService } from '@/services/event.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NormalizedCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  venueName: string;
  isRegistered: boolean;
  status: string;
  eventType: string;
  category?: string;
}

export default function StudentCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterMode, setFilterMode] = useState<'registered' | 'all'>('registered');

  // Fetch student registrations
  const { data: registrations, isLoading: isLoadingRegs } = useQuery({
    queryKey: ['my-registrations-calendar'],
    queryFn: registrationService.getMyRegistrations,
  });

  // Fetch campus events
  const { data: campusEventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['campus-events-calendar'],
    queryFn: () => eventService.getEvents({ limit: 100 }),
  });

  const registeredEventIds = new Set((registrations || []).map((r) => r.event_id));

  // Normalize events
  const allEvents: NormalizedCalendarEvent[] = [];

  // Add from registrations
  (registrations || []).forEach((reg) => {
    if (reg.event?.start_datetime) {
      try {
        allEvents.push({
          id: reg.event_id,
          title: reg.event.title,
          start: parseISO(reg.event.start_datetime),
          end: reg.event.end_datetime ? parseISO(reg.event.end_datetime) : parseISO(reg.event.start_datetime),
          venueName: typeof reg.event.venue === 'string' ? reg.event.venue : reg.event.venue?.name || 'Campus Venue',
          isRegistered: true,
          status: reg.status,
          eventType: reg.event.event_type || 'offline',
          category: typeof reg.event.category === 'string' ? reg.event.category : reg.event.category?.name,
        });
      } catch (e) {
        // ignore parse error
      }
    }
  });

  // If showing all, add other campus events
  if (filterMode === 'all') {
    (campusEventsData?.items || []).forEach((ev) => {
      if (!registeredEventIds.has(ev.id) && ev.start_datetime) {
        try {
          allEvents.push({
            id: ev.id,
            title: ev.title,
            start: parseISO(ev.start_datetime),
            end: ev.end_datetime ? parseISO(ev.end_datetime) : parseISO(ev.start_datetime),
            venueName: typeof ev.venue === 'string' ? ev.venue : ev.venue?.name || 'Campus Venue',
            isRegistered: false,
            status: ev.status,
            eventType: ev.event_type || 'offline',
            category: typeof ev.category === 'string' ? ev.category : ev.category?.name,
          });
        } catch (e) {
          // ignore parse error
        }
      }
    });
  }

  // Days in calendar month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Filter events for selected day
  const eventsOnSelectedDay = allEvents.filter((ev) => isSameDay(ev.start, selectedDate));

  // Upcoming events in this month
  const upcomingInMonth = allEvents
    .filter((ev) => isSameMonth(ev.start, currentMonth) && ev.start >= new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const createGoogleCalendarUrl = (ev: NormalizedCalendarEvent) => {
    const title = encodeURIComponent(ev.title);
    const location = encodeURIComponent(ev.venueName);
    const details = encodeURIComponent(`Event link: ${window.location.origin}/events/${ev.id}`);
    const startStr = ev.start.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endStr = ev.end.toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Events Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Keep track of your registered sessions, workshops, and upcoming campus activities.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border">
          <Button
            variant={filterMode === 'registered' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterMode('registered')}
            className="text-xs font-semibold"
          >
            My Schedule ({registrations?.length || 0})
          </Button>
          <Button
            variant={filterMode === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterMode('all')}
            className="text-xs font-semibold"
          >
            All Campus Events
          </Button>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (7 cols), Selected Day Agenda on Right (5 cols) */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Calendar Grid Section */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                  <Button variant="outline" size="sm" onClick={goToToday} className="h-7 text-xs px-2.5">
                    Today
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold text-muted-foreground">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((day, idx) => {
                  const dayEvents = allEvents.filter((ev) => isSameDay(ev.start, day));
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const isDayToday = isToday(day);
                  const hasRegisteredEvent = dayEvents.some((ev) => ev.isRegistered);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[64px] sm:min-h-[76px] p-1.5 sm:p-2 rounded-xl flex flex-col justify-between items-start text-left transition-all border ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-semibold'
                          : isCurrentMonth
                          ? 'border-border/60 hover:bg-muted/50 bg-background'
                          : 'border-transparent text-muted-foreground/40 bg-muted/10'
                      }`}
                    >
                      <span
                        className={`text-xs h-6 w-6 rounded-full flex items-center justify-center ${
                          isDayToday
                            ? 'bg-primary text-primary-foreground font-bold'
                            : isSelected
                            ? 'text-primary font-bold'
                            : ''
                        }`}
                      >
                        {format(day, 'd')}
                      </span>

                      {/* Event Indicator Pills / Dots */}
                      {dayEvents.length > 0 && (
                        <div className="w-full mt-1 space-y-1 overflow-hidden">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              className={`text-[10px] leading-tight truncate px-1.5 py-0.5 rounded ${
                                ev.isRegistered
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[9px] text-muted-foreground block text-right font-medium">
                              +{dayEvents.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>My Registered Event</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span>Campus Event</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Day Agenda & Upcoming Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Date Header */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </CardTitle>
                  <CardDescription>
                    {eventsOnSelectedDay.length} {eventsOnSelectedDay.length === 1 ? 'event' : 'events'} scheduled
                  </CardDescription>
                </div>
                {isToday(selectedDate) && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    Today
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {isLoadingRegs || isLoadingEvents ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading schedule...
                </div>
              ) : eventsOnSelectedDay.length > 0 ? (
                <div className="space-y-4">
                  {eventsOnSelectedDay.map((ev) => (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-xl border transition-all ${
                        ev.isRegistered
                          ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                          : 'border-border hover:border-primary/40 bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {ev.isRegistered && (
                              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-[10px]">
                                Registered
                              </Badge>
                            )}
                            {ev.category && (
                              <Badge variant="outline" className="text-[10px]">
                                {ev.category}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-base text-foreground mt-1">{ev.title}</h4>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>
                            {format(ev.start, 'h:mm a')}
                            {ev.end ? ` - ${format(ev.end, 'h:mm a')}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{ev.venueName}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2">
                        <Button variant="outline" size="sm" asChild className="text-xs h-8">
                          <Link href={`/events/${ev.id}`}>
                            View Event <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-muted-foreground hover:text-foreground"
                          onClick={() => window.open(createGoogleCalendarUrl(ev), '_blank')}
                        >
                          + Google Calendar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-sm">No Events Scheduled</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    You have no events on this day. Explore campus events to register for upcoming sessions.
                  </p>
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <Link href="/events">Explore Events</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Up This Month */}
          {upcomingInMonth.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Coming Up Soon
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {upcomingInMonth.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedDate(ev.start)}
                      className="p-3.5 flex items-center justify-between gap-3 text-sm hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <div className="overflow-hidden">
                        <p className="font-medium text-xs truncate text-foreground">{ev.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(ev.start, 'MMM d, yyyy')} • {format(ev.start, 'h:mm a')}
                        </p>
                      </div>
                      <Badge variant={ev.isRegistered ? 'default' : 'outline'} className="text-[10px] shrink-0">
                        {ev.isRegistered ? 'Registered' : 'Campus'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
