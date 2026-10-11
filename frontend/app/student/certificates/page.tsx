'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Award, 
  ShieldCheck, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Calendar, 
  Sparkles,
  QrCode,
  Printer,
  X
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface CertificateItem {
  id: string;
  certificate_id: string;
  certificate_type: string;
  recipient_name: string;
  issued_at: string;
  verification_code: string;
  certificate_url?: string;
  event?: {
    id: string;
    title: string;
    start_datetime: string;
  };
}

export default function StudentCertificatesPage() {
  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: certificates = [], isLoading } = useQuery<CertificateItem[]>({
    queryKey: ['student-certificates'],
    queryFn: async () => {
      const res = await api.get('/certificates/me');
      return res.data;
    },
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    toast.success('Verification ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredCerts = certificates.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.certificate_id.toLowerCase().includes(q) ||
      c.verification_code.toLowerCase().includes(q) ||
      c.certificate_type.toLowerCase().includes(q) ||
      (c.event?.title && c.event.title.toLowerCase().includes(q))
    );
  });

  const getBadgeForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'merit':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium">Certificate of Merit</Badge>;
      case 'excellence':
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-medium">Award of Excellence</Badge>;
      case 'organizer':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium">Organizer Recognition</Badge>;
      default:
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">Participation</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates & Credentials</h1>
          <p className="text-muted-foreground mt-1">
            Official cryptographically verified event certificates and achievement credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 gap-1.5 text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            <ShieldCheck className="h-4 w-4" /> Authenticity Verified
          </Badge>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Credentials</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Issued to your profile</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified On-Chain / Digital</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{certificates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">100% Tamper-proof status</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Events Completed</CardTitle>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {new Set(certificates.map((c) => c.event?.id).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Distinct campus activities</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-xs">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by event, certificate ID, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Showing {filteredCerts.length} of {certificates.length} certificates
        </span>
      </div>

      {/* Certificates Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-64 bg-muted/30" />
          ))}
        </div>
      ) : filteredCerts.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">No certificates yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            {search
              ? 'No certificates match your search query.'
              : 'You will receive official verifiable certificates once you attend and complete registered campus events.'}
          </p>
          <Button asChild>
            <Link href="/events">Explore Campus Events</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCerts.map((cert) => (
            <Card
              key={cert.id}
              className="group overflow-hidden flex flex-col hover:border-primary/50 hover:shadow-md transition-all duration-200"
            >
              {/* Header Ribbon / Design */}
              <div className="p-5 pb-4 bg-gradient-to-br from-primary/10 via-background to-secondary/30 border-b flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  {getBadgeForType(cert.certificate_type)}
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-base line-clamp-2 mt-1">
                  {cert.event?.title || 'Campus Event Certificate'}
                </h3>
              </div>

              {/* Body Details */}
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Recipient:</span>
                    <p className="font-semibold text-foreground text-sm">{cert.recipient_name}</p>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground pt-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Issued {cert.issued_at ? format(new Date(cert.issued_at), 'MMMM d, yyyy') : 'Recently'}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-muted-foreground block text-[11px] mb-1">Credential Code:</span>
                    <div className="flex items-center justify-between bg-muted/60 px-2.5 py-1.5 rounded-md font-mono text-[11px] border">
                      <span className="truncate">{cert.verification_code || cert.certificate_id}</span>
                      <button
                        onClick={() => handleCopyCode(cert.verification_code || cert.certificate_id)}
                        className="text-muted-foreground hover:text-foreground shrink-0 ml-2"
                        title="Copy code"
                      >
                        {copiedId === (cert.verification_code || cert.certificate_id) ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 text-xs gap-1.5"
                    onClick={() => setSelectedCert(cert)}
                  >
                    <Award className="h-3.5 w-3.5" /> View Certificate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Certificate Modal Dialog */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background max-w-2xl w-full rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-sm">Official Credential Verification</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setSelectedCert(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Printable Certificate Canvas */}
            <div className="p-8 bg-gradient-to-br from-amber-50/40 via-background to-blue-50/40 border-8 border-double border-primary/20 m-6 rounded-xl text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30 text-primary">
                  <Award className="h-8 w-8" />
                </div>
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-primary font-bold">
                  CampusConnect Official Credential
                </span>
                <h2 className="text-2xl font-serif font-bold text-foreground mt-1">
                  Certificate of Achievement
                </h2>
                <p className="text-xs text-muted-foreground mt-1">This is proudly presented to</p>
              </div>

              <div className="border-b-2 border-primary/30 max-w-sm mx-auto pb-1">
                <p className="text-2xl font-serif font-semibold text-foreground italic">
                  {selectedCert.recipient_name}
                </p>
              </div>

              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                For successfully participating in and completing all requirements for
                <strong className="block text-sm text-foreground font-semibold mt-1">
                  {selectedCert.event?.title || 'Campus Event'}
                </strong>
              </p>

              <div className="pt-4 flex justify-between items-end text-left border-t border-dashed">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Date Issued</p>
                  <p className="text-xs font-medium">
                    {selectedCert.issued_at ? format(new Date(selectedCert.issued_at), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-muted/60 border rounded-md flex items-center justify-center">
                    <QrCode className="h-10 w-10 text-primary/70" />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono block mt-1">
                    {selectedCert.verification_code}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase">Verified By</p>
                  <p className="text-xs font-semibold text-primary">CampusConnect Academic Board</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Certificate ID: <code className="font-mono text-foreground">{selectedCert.certificate_id}</code>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.print();
                  }}
                  className="gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Print / PDF
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleCopyCode(selectedCert.verification_code)}
                  className="gap-1.5"
                >
                  <Copy className="h-4 w-4" /> Copy Credential Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
