'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, ExternalLink, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { adminService } from '@/services/admin.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import Link from 'next/link';

export default function EventApprovalsPage() {
  const queryClient = useQueryClient();

  const { data: eventsResponse, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => adminService.getEvents({ status: 'pending_approval' }),
  });

  const approveMutation = useMutation({
    mutationFn: adminService.approveEvent,
    onSuccess: () => {
      toast.success('Event approved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to approve event');
    }
  });

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and approve events submitted by organizers.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Title</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32">Loading pending events...</TableCell>
              </TableRow>
            ) : !eventsResponse?.items || eventsResponse.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  No events pending approval.
                </TableCell>
              </TableRow>
            ) : (
              eventsResponse.items.map((event: any) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{event.title}</span>
                      <span className="text-xs text-muted-foreground">{event.event_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{event.organizer?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(event.start_datetime), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild title="Preview Event">
                      <Link href={`/events/${event.id}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      title="Reject"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-green-600 hover:bg-green-600/10"
                      title="Approve"
                      disabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(event.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
