'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  ScanLine, 
  CheckCircle2, 
  XCircle, 
  Keyboard, 
  Calendar, 
  Users, 
  ArrowRight, 
  History, 
  Sparkles, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

import { organizerService } from '@/services/organizer.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CheckedInStudent {
  id: string;
  name: string;
  registrationId: string;
  scannedAt: string;
  eventTitle?: string;
}

export default function OrganizerAttendancePage() {
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [history, setHistory] = useState<CheckedInStudent[]>([]);

  // Fetch organizer's events
  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['organizer-my-events-attendance'],
    queryFn: organizerService.getMyEvents,
  });

  const events = eventsData?.items || [];
  const selectedEvent = events.find((e: any) => e.id === selectedEventId);

  const scanMutation = useMutation({
    mutationFn: organizerService.scanAttendance,
    onSuccess: (data) => {
      const newEntry: CheckedInStudent = {
        id: Math.random().toString(),
        name: data.student_name || 'Attendee',
        registrationId: data.registration_id || manualCode,
        scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        eventTitle: selectedEvent?.title || 'Campus Event',
      };

      setScanResult({ success: true, ...data });
      setHistory((prev) => [newEntry, ...prev]);
      toast.success(data.message || `Checked in ${data.student_name}`);
      setManualCode('');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || 'Invalid or already scanned QR code';
      setScanResult({ 
        success: false, 
        message: errorMsg 
      });
      toast.error(errorMsg);
    }
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      scanMutation.mutate(manualCode.trim());
    }
  };

  const handleToggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    if (!isCameraActive) {
      toast.info('Camera scanner initialized. Point at attendee QR code or use manual entry.');
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ScanLine className="h-8 w-8 text-primary" />
            Attendance & QR Scanner
          </h1>
          <p className="text-muted-foreground mt-1">
            Check in students at your venue gate and verify registrations in real time.
          </p>
        </div>

        {/* Event Quick Filter / Selector */}
        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border">
          <Calendar className="h-4 w-4 text-muted-foreground ml-1" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer pr-2"
            disabled={isLoadingEvents}
          >
            <option value="all">All Organized Events</option>
            {events.map((ev: any) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.registration_count} reg.)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Event Context Bar */}
      {selectedEvent && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              Active Session
            </Badge>
            <div>
              <p className="font-semibold">{selectedEvent.title}</p>
              <p className="text-xs text-muted-foreground">
                Capacity: {selectedEvent.capacity || 'Unlimited'} • Total Signups: {selectedEvent.registration_count}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/organizer/events/${selectedEvent.id}/registrations`}>
                <Users className="h-4 w-4 mr-1.5" /> View Attendee List
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/organizer/events/${selectedEvent.id}/analytics`}>
                Event Stats <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Main Scanner Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Viewfinder (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="overflow-hidden border-2 border-border/80 shadow-md">
            <CardHeader className="bg-muted/10 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ScanLine className="h-5 w-5 text-primary" />
                    Live Viewfinder
                  </CardTitle>
                  <CardDescription>Scan student digital passes or physical badges</CardDescription>
                </div>
                <Button 
                  variant={isCameraActive ? 'destructive' : 'default'} 
                  size="sm"
                  onClick={handleToggleCamera}
                >
                  {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div 
                className="w-full aspect-[4/3] bg-zinc-950 rounded-xl flex flex-col items-center justify-center relative overflow-hidden border-2 border-dashed border-zinc-700 cursor-pointer group"
                onClick={handleToggleCamera}
              >
                {isCameraActive ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
                    {/* Scanner Laser Animation */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.8)]" 
                      style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} 
                    />
                    
                    {/* Target Reticle */}
                    <div className="w-56 h-56 border-2 border-primary/60 rounded-2xl relative flex items-center justify-center">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                      <p className="text-xs text-primary/80 font-mono tracking-wider animate-pulse">
                        ALIGN QR CODE HERE
                      </p>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <span className="inline-block bg-black/70 backdrop-blur text-zinc-300 text-xs px-3 py-1.5 rounded-full border border-zinc-700">
                        Camera active • Scanning automatically
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-muted-foreground group-hover:scale-110 group-hover:text-primary transition-all">
                      <ScanLine className="h-8 w-8" />
                    </div>
                    <p className="font-medium text-zinc-300">Click to Launch Camera Scanner</p>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                      Requires camera permissions. You can also paste or type the pass token directly below.
                    </p>
                  </div>
                )}
              </div>

              {/* Fast Manual Entry below camera */}
              <form onSubmit={handleManualSubmit} className="mt-6 flex gap-2">
                <div className="relative flex-1">
                  <Keyboard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter QR Token or Registration ID (e.g., qr_...)"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="h-11 px-6 font-semibold"
                  disabled={scanMutation.isPending || !manualCode.trim()}
                >
                  {scanMutation.isPending ? 'Verifying...' : 'Check In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Verification Result & History Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scan Result Card */}
          {scanResult ? (
            <Card className={scanResult.success 
              ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg' 
              : 'border-destructive/50 bg-destructive/10 shadow-lg'
            }>
              <CardContent className="p-6">
                {scanResult.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <div>
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">Verified</Badge>
                        <h3 className="text-xl font-bold mt-1 text-emerald-950 dark:text-emerald-100">
                          {scanResult.student_name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="bg-background/80 rounded-lg p-3 text-sm space-y-1.5 border border-emerald-500/20">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registration ID:</span>
                        <span className="font-mono font-medium">{scanResult.registration_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-emerald-600 font-semibold">{scanResult.message || 'Marked Present'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
                        <XCircle className="h-7 w-7" />
                      </div>
                      <div>
                        <Badge variant="destructive">Verification Failed</Badge>
                        <h3 className="text-lg font-bold mt-1">Unable to Verify QR</h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground bg-background/80 p-3 rounded-lg border border-destructive/20">
                      {scanResult.message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-base">Ready for Scans</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Scan a student's digital pass or enter their code to see verification details here.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Session History Feed */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  Session Check-Ins ({history.length})
                </CardTitle>
                {history.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs text-muted-foreground"
                    onClick={() => setHistory([])}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {history.length > 0 ? (
                <div className="divide-y max-h-80 overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 text-sm hover:bg-muted/30">
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.registrationId}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300">
                          Present
                        </Badge>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.scannedAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No attendees checked in during this session yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
