import Link from 'next/link';
import { format } from 'date-fns';
import { Heart, Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface EventCardProps {
  id: string;
  title: string;
  image?: string;
  category: string;
  date: string;
  venue?: string;
  registrations: number;
  capacity?: number;
  status: string;
  featured?: boolean;
}

export function EventCard({
  id,
  title,
  image,
  category,
  date,
  venue,
  registrations,
  capacity,
  status,
  featured,
}: EventCardProps) {
  const isFull = capacity ? registrations >= capacity : false;
  const progress = capacity ? (registrations / capacity) * 100 : 0;

  return (
    <Card className={`group overflow-hidden flex flex-col transition-all hover:shadow-md ${featured ? 'border-primary shadow-sm' : ''}`}>
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            <span className="text-muted-foreground text-sm font-medium">No Image</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-sm">
            {category}
          </Badge>
          {featured && (
            <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-sm">
              Featured
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/50 hover:bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-lg line-clamp-1 mb-2" title={title}>
          {title}
        </h3>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="truncate">{format(new Date(date), 'MMM d, yyyy • h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{venue || 'Online'}</span>
          </div>
        </div>

        {capacity && (
          <div className="space-y-1.5 mt-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {registrations} / {capacity} Registered
              </span>
              <span className={isFull ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                {isFull ? 'Full' : `${capacity - registrations} left`}
              </span>
            </div>
            <Progress value={progress} className={`h-1.5 ${isFull ? 'bg-destructive/20' : ''}`} />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" variant={isFull ? 'secondary' : 'default'}>
          <Link href={`/events/${id}`}>
            {isFull ? 'Join Waitlist' : 'View Event'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
