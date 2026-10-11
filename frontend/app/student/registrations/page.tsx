'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { QrCode, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { registrationService } from '@/services/registration.service';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';

export default function MyRegistrationsPage() {
  const queryClient = useQueryClient();

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: registrationService.getMyRegistrations,
  });

  const cancelMutation = useMutation({
    mutationFn: registrationService.cancelRegistration,
    onSuccess: () => {
      toast.success('Registration cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to cancel registration');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!registrations || registrations.length === 0) {
    return (
      <div className="text-center py-20 border rounded-lg bg-muted/10">
        <h3 className="text-xl font-medium mb-2">No registrations yet</h3>
        <p className="text-muted-foreground mb-6">You haven't registered for any events.</p>
        <Button asChild>
          <Link href="/events">Explore Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {registrations.map((reg) => (
          <Card key={reg.id} className="flex flex-col">
            <div className="relative aspect-[2/1] w-full overflow-hidden bg-muted rounded-t-xl">
              {reg.event?.banner_image ? (
                <img src={reg.event.banner_image} alt={reg.event.title} className="object-cover w-full h-full" />
              ) : (
                <div className="flex h-full items-center justify-center bg-primary/5">
                  <span className="text-muted-foreground text-sm">No Image</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={
                  reg.status === 'registered' ? 'default' :
                  reg.status === 'attended' ? 'secondary' :
                  reg.status === 'cancelled' ? 'destructive' : 'outline'
                }>
                  {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            <CardContent className="flex-1 p-5">
              <p className="text-xs text-muted-foreground mb-1">
                ID: <span className="font-mono text-foreground">{reg.registration_id}</span>
              </p>
              <h3 className="font-semibold text-lg line-clamp-1 mb-2">
                {reg.event?.title || 'Unknown Event'}
              </h3>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{reg.event ? format(new Date(reg.event.start_datetime), 'MMM d, yyyy • h:mm a') : ''}</p>
                <p>Registered on: {format(new Date(reg.registered_at), 'MMM d, yyyy')}</p>
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 flex gap-2">
              {reg.status === 'registered' && (
                <>
                  <Popover>
                    <PopoverTrigger className={buttonVariants({ variant: "outline", className: "flex-1 gap-2 border-primary/20 text-primary hover:bg-primary/5" })}>
                        <QrCode className="h-4 w-4" />
                        Ticket QR
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 flex flex-col items-center">
                      <div className="bg-black text-white p-4 rounded-lg flex items-center justify-center h-48 w-48 mb-2">
                        {/* Mock QR Code */}
                        <div className="grid grid-cols-5 grid-rows-5 gap-1 w-full h-full p-2 bg-white">
                          {[...Array(25)].map((_, i) => (
                            <div key={i} className={Math.random() > 0.5 ? "bg-black" : "bg-white"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-center text-muted-foreground font-mono">
                        {reg.registration_id}
                      </p>
                      <p className="text-xs text-center text-muted-foreground mt-1">
                        Show this at the entrance
                      </p>
                    </PopoverContent>
                  </Popover>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Cancel Registration"
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this registration?')) {
                        cancelMutation.mutate(reg.registration_id);
                      }
                    }}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </>
              )}
              {reg.status !== 'registered' && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/events/${reg.event_id}`}>View Event</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
