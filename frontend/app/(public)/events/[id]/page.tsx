'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Calendar, MapPin, Users, Heart, Share2, ArrowLeft, 
  Clock, Info, ShieldAlert, Award, Loader2 
} from 'lucide-react';

import { eventService } from '@/services/event.service';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function EventDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEvent(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Event not found</h2>
        <Button onClick={() => router.push('/events')}>Back to Events</Button>
      </div>
    );
  }

  const isFull = event.capacity ? event.registration_count >= event.capacity : false;

  const handleRegister = () => {
    if (!user) {
      toast.error('Please login to register for this event');
      router.push(`/auth/login?redirect=/events/${id}`);
      return;
    }
    // TODO: Implement registration mutation
    toast.success('Registration initiated!');
  };

  return (
    <div className="pb-20">
      {/* Banner Section */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-muted">
        {event.banner_image ? (
          <img
            src={event.banner_image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
            <Calendar className="h-32 w-32 text-primary/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute bottom-0 w-full">
          <div className="container mx-auto px-4 md:px-6 pb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4 text-muted-foreground hover:text-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                {event.category?.name || 'General'}
              </Badge>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
              </Badge>
              {event.is_featured && (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 backdrop-blur-sm border-amber-500/30">
                  Featured
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 text-foreground">
              {event.title}
            </h1>
            
            {event.short_description && (
              <p className="text-xl text-muted-foreground max-w-3xl">
                {event.short_description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">About</TabsTrigger>
                <TabsTrigger value="rules" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">Rules & Eligibility</TabsTrigger>
                {event.faq && <TabsTrigger value="faq" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">FAQ</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="about" className="pt-6 prose prose-neutral dark:prose-invert max-w-none">
                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-primary" />
                  About this event
                </h3>
                <div className="whitespace-pre-wrap text-muted-foreground">
                  {event.description || 'No detailed description available.'}
                </div>

                {event.speakers && event.speakers.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-2xl font-semibold mb-6">Speakers & Guests</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {event.speakers.map((speaker: any) => (
                        <Card key={speaker.id} className="bg-muted/40 border-none shadow-none">
                          <CardContent className="p-4 flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                              <AvatarImage src={speaker.photo} alt={speaker.name} />
                              <AvatarFallback>{speaker.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{speaker.name}</p>
                              <p className="text-sm text-muted-foreground">{speaker.designation}</p>
                              {speaker.organization && <p className="text-xs text-muted-foreground">{speaker.organization}</p>}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="rules" className="pt-6 space-y-8">
                {event.eligibility && (
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <ShieldAlert className="h-5 w-5 text-primary" />
                      Eligibility
                    </h3>
                    <div className="whitespace-pre-wrap text-muted-foreground p-4 bg-muted/30 rounded-lg">
                      {event.eligibility}
                    </div>
                  </div>
                )}
                
                {event.rules && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Rules & Guidelines</h3>
                    <div className="whitespace-pre-wrap text-muted-foreground list-disc p-4 border rounded-lg">
                      {event.rules}
                    </div>
                  </div>
                )}

                {event.prizes && (
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <Award className="h-5 w-5 text-primary" />
                      Prizes & Rewards
                    </h3>
                    <div className="whitespace-pre-wrap text-muted-foreground p-4 bg-primary/5 border border-primary/10 rounded-lg">
                      {event.prizes}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {event.faq && (
                <TabsContent value="faq" className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
                  {/* Map through FAQ object here. Assuming it's an array or dict */}
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto">
                    {JSON.stringify(event.faq, null, 2)}
                  </pre>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar / Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-md border-primary/10">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.start_datetime), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.start_datetime), 'h:mm a')} - {format(new Date(event.end_datetime), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {event.venue?.name || (event.event_type === 'online' ? 'Online Event' : 'TBD')}
                      </p>
                      {event.venue?.building && (
                        <p className="text-sm text-muted-foreground">
                          {event.venue.building}, Room {event.venue.room}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {event.capacity && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-primary mt-0.5" />
                        <div className="w-full">
                          <p className="font-medium flex justify-between">
                            <span>Capacity</span>
                            <span className={isFull ? 'text-destructive' : 'text-muted-foreground'}>
                              {event.registration_count} / {event.capacity}
                            </span>
                          </p>
                          <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                            <div 
                              className={`h-full ${isFull ? 'bg-destructive' : 'bg-primary'}`} 
                              style={{ width: `${Math.min((event.registration_count / event.capacity) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <Separator />
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={event.organizer?.profile_image} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {event.organizer?.name?.charAt(0) || 'O'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-muted-foreground">Organized by</p>
                      <p className="font-medium text-sm">{event.organizer?.name || 'Unknown Organizer'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4">
                  <Button 
                    className="w-full font-semibold text-md h-12 shadow-md" 
                    size="lg"
                    variant={isFull ? 'secondary' : 'default'}
                    onClick={handleRegister}
                  >
                    {isFull ? 'Join Waitlist' : 'Register Now'}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full flex-1 gap-2">
                      <Heart className="h-4 w-4" />
                      Favorite
                    </Button>
                    <Button variant="outline" className="w-full flex-1 gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
