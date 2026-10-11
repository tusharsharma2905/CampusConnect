'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ScanLine, CheckCircle2, XCircle, ArrowLeft, Keyboard } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';

import { organizerService } from '@/services/organizer.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function QRScannerPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);

  const scanMutation = useMutation({
    mutationFn: organizerService.scanAttendance,
    onSuccess: (data) => {
      setScanResult({ success: true, ...data });
      toast.success(data.message || 'Attendance marked successfully');
      setManualCode('');
    },
    onError: (error: any) => {
      setScanResult({ 
        success: false, 
        message: error.response?.data?.detail || 'Failed to scan QR' 
      });
      toast.error('Scan failed');
    }
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      scanMutation.mutate(manualCode.trim());
    }
  };

  const simulateCameraScan = () => {
    // In a real app, this would use a library like react-qr-reader
    toast.info('Camera scanning not implemented in this demo. Please use manual entry.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Scanner</h1>
          <p className="text-muted-foreground mt-1">Mark student attendance at the gate.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5" /> Camera Scanner
            </CardTitle>
            <CardDescription>Point camera at student QR code</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div 
              className="w-full aspect-square bg-black rounded-lg flex items-center justify-center cursor-pointer border-4 border-dashed border-muted overflow-hidden relative group"
              onClick={simulateCameraScan}
            >
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium">Click to Start Camera</span>
              </div>
              <ScanLine className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Make sure the QR code is well-lit and in focus.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" /> Manual Entry
              </CardTitle>
              <CardDescription>If camera is not working</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input 
                  placeholder="Enter token (e.g. qr_123...)" 
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
                <Button type="submit" disabled={scanMutation.isPending || !manualCode}>
                  {scanMutation.isPending ? 'Verifying...' : 'Submit'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {scanResult && (
            <Card className={scanResult.success ? 'border-green-500 bg-green-500/5' : 'border-destructive bg-destructive/5'}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                {scanResult.success ? (
                  <>
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                    <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Verified!</h3>
                    <p className="font-medium mt-2 text-lg">{scanResult.student_name}</p>
                    <p className="text-sm text-muted-foreground">{scanResult.registration_id}</p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-12 w-12 text-destructive mb-2" />
                    <h3 className="text-xl font-bold text-destructive">Invalid QR Code</h3>
                    <p className="text-sm text-muted-foreground mt-2">{scanResult.message}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
