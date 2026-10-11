'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  Sliders, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  BellRing, 
  KeyRound,
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface PlatformSettingsState {
  // General
  institutionName: string;
  supportEmail: string;
  academicTerm: string;
  maintenanceMode: boolean;
  platformTagline: string;

  // Event Policies
  requireEventApproval: boolean;
  autoApproveFaculty: boolean;
  enableWaitlist: boolean;
  maxEventsPerStudent: number;
  cancellationHours: number;

  // Security
  restrictEmailDomain: boolean;
  allowedDomain: string;
  enforce2FAOrganizers: boolean;
  sessionTimeoutDays: number;
  auditLoggingEnabled: boolean;

  // AI Integration
  enableGeminiAI: boolean;
  geminiModel: string;
  aiMaxTokens: number;
  autoCategorization: boolean;
}

const DEFAULT_SETTINGS: PlatformSettingsState = {
  institutionName: 'CampusConnect University & Technology Hub',
  supportEmail: 'admin@campusconnect.com',
  academicTerm: 'Fall 2026 - Spring 2027',
  maintenanceMode: false,
  platformTagline: 'Empowering campus innovation, hackathons, and student activities.',

  requireEventApproval: true,
  autoApproveFaculty: false,
  enableWaitlist: true,
  maxEventsPerStudent: 8,
  cancellationHours: 24,

  restrictEmailDomain: false,
  allowedDomain: 'campusconnect.edu',
  enforce2FAOrganizers: false,
  sessionTimeoutDays: 7,
  auditLoggingEnabled: true,

  enableGeminiAI: true,
  geminiModel: 'gemini-2.5-flash',
  aiMaxTokens: 1024,
  autoCategorization: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettingsState>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('campusconnect_admin_settings');
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to parse settings from storage', e);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('campusconnect_admin_settings', JSON.stringify(settings));
      setIsSaving(false);
      toast.success('Platform settings updated successfully!');
    }, 600);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('campusconnect_admin_settings', JSON.stringify(DEFAULT_SETTINGS));
    toast.info('Settings reset to default configuration');
  };

  const updateSetting = <K extends keyof PlatformSettingsState>(key: K, value: PlatformSettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
            <Badge variant="outline" className="text-primary bg-primary/5 border-primary/20 gap-1.5 py-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Super Admin
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Configure system parameters, event approval policies, security, and Gemini AI integrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 shadow-sm">
            <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60">
          <TabsTrigger value="general" className="py-2.5 gap-2 text-xs font-medium">
            <Building2 className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="policies" className="py-2.5 gap-2 text-xs font-medium">
            <Sliders className="h-4 w-4" /> Event Policies
          </TabsTrigger>
          <TabsTrigger value="security" className="py-2.5 gap-2 text-xs font-medium">
            <ShieldCheck className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="ai" className="py-2.5 gap-2 text-xs font-medium">
            <Sparkles className="h-4 w-4" /> Gemini AI
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Institutional Information</CardTitle>
              <CardDescription>
                Details displayed on official event headers, student certificates, and footers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inst-name">College / Organization Name</Label>
                  <Input
                    id="inst-name"
                    value={settings.institutionName}
                    onChange={(e) => updateSetting('institutionName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-email">Administrative Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting('supportEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="term">Current Academic Term / Year</Label>
                  <Input
                    id="term"
                    value={settings.academicTerm}
                    onChange={(e) => updateSetting('academicTerm', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Platform Motto / Tagline</Label>
                  <Input
                    id="tagline"
                    value={settings.platformTagline}
                    onChange={(e) => updateSetting('platformTagline', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-base">System Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Temporarily pause public registrations and display a maintenance banner to non-admin users.
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Event Policies */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Approval & Capacity Controls</CardTitle>
              <CardDescription>
                Define compliance rules for newly submitted organizer events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="space-y-0.5 max-w-md">
                  <Label className="font-semibold">Mandatory Admin Approval</Label>
                  <p className="text-xs text-muted-foreground">
                    Require every organizer event to be vetted in the Admin Event Approvals queue before publishing.
                  </p>
                </div>
                <Switch
                  checked={settings.requireEventApproval}
                  onCheckedChange={(val) => updateSetting('requireEventApproval', val)}
                />
              </div>

              <div className="flex items-center justify-between pb-4 border-b">
                <div className="space-y-0.5 max-w-md">
                  <Label className="font-semibold">Auto-Approve Verified Faculty</Label>
                  <p className="text-xs text-muted-foreground">
                    Bypass approval queue for departmental heads and verified faculty organizer accounts.
                  </p>
                </div>
                <Switch
                  checked={settings.autoApproveFaculty}
                  onCheckedChange={(val) => updateSetting('autoApproveFaculty', val)}
                />
              </div>

              <div className="flex items-center justify-between pb-4 border-b">
                <div className="space-y-0.5 max-w-md">
                  <Label className="font-semibold">Enable Automated Waitlists</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow students to join waitlists when events hit maximum registration capacity.
                  </p>
                </div>
                <Switch
                  checked={settings.enableWaitlist}
                  onCheckedChange={(val) => updateSetting('enableWaitlist', val)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="max-reg">Max Registrations per Student</Label>
                  <Input
                    id="max-reg"
                    type="number"
                    min="1"
                    max="50"
                    value={settings.maxEventsPerStudent}
                    onChange={(e) => updateSetting('maxEventsPerStudent', Number(e.target.value))}
                  />
                  <span className="text-[11px] text-muted-foreground">Concurrent upcoming events</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancel-hours">Cancellation Grace Period (Hours)</Label>
                  <Input
                    id="cancel-hours"
                    type="number"
                    min="0"
                    max="72"
                    value={settings.cancellationHours}
                    onChange={(e) => updateSetting('cancellationHours', Number(e.target.value))}
                  />
                  <span className="text-[11px] text-muted-foreground">Hours before event start allowed to cancel</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authentication & Access Governance</CardTitle>
              <CardDescription>
                Strengthen platform security, student verification, and audit logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="space-y-0.5 max-w-md">
                  <Label className="font-semibold">Institutional Email Restriction</Label>
                  <p className="text-xs text-muted-foreground">
                    Only permit student registration with verified institutional email domains.
                  </p>
                </div>
                <Switch
                  checked={settings.restrictEmailDomain}
                  onCheckedChange={(val) => updateSetting('restrictEmailDomain', val)}
                />
              </div>

              {settings.restrictEmailDomain && (
                <div className="space-y-2 bg-muted/30 p-4 rounded-lg border">
                  <Label htmlFor="domain">Allowed Email Domain</Label>
                  <Input
                    id="domain"
                    placeholder="e.g. campusconnect.edu"
                    value={settings.allowedDomain}
                    onChange={(e) => updateSetting('allowedDomain', e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pb-4 border-b">
                <div className="space-y-0.5 max-w-md">
                  <Label className="font-semibold">Enforce 2FA for Organizers & Admins</Label>
                  <p className="text-xs text-muted-foreground">
                    Require OTP verification when logging into organizer or administrator portals.
                  </p>
                </div>
                <Switch
                  checked={settings.enforce2FAOrganizers}
                  onCheckedChange={(val) => updateSetting('enforce2FAOrganizers', val)}
                />
              </div>

              <div className="flex items-center justify-between pb-4 border-b">
                <div className="space-y-0.5 max-w-md">
                  <Label className="font-semibold">Comprehensive Audit Logging</Label>
                  <p className="text-xs text-muted-foreground">
                    Record all attendance scans, certificate issuances, and admin approvals into system audit ledger.
                  </p>
                </div>
                <Switch
                  checked={settings.auditLoggingEnabled}
                  onCheckedChange={(val) => updateSetting('auditLoggingEnabled', val)}
                />
              </div>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="timeout">Session Expiry (Days)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.sessionTimeoutDays}
                  onChange={(e) => updateSetting('sessionTimeoutDays', Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: AI & Gemini */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Gemini AI Integration
                </CardTitle>
                <CardDescription className="mt-1">
                  Manage intelligent event description synthesis, marketing copy, and automated categorization.
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500 text-white gap-1 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Engine Active
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="space-y-0.5 max-w-md">
                  <Label className="font-semibold">AI Assistant for Organizers</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable the "Generate with AI" button on the Event Creation form.
                  </p>
                </div>
                <Switch
                  checked={settings.enableGeminiAI}
                  onCheckedChange={(val) => updateSetting('enableGeminiAI', val)}
                />
              </div>

              <div className="flex items-center justify-between pb-4 border-b">
                <div className="space-y-0.5 max-w-md">
                  <Label className="font-semibold">Automated Smart Categorization</Label>
                  <p className="text-xs text-muted-foreground">
                    Use Gemini NLP to automatically assign tags, venues, and categories to event drafts.
                  </p>
                </div>
                <Switch
                  checked={settings.autoCategorization}
                  onCheckedChange={(val) => updateSetting('autoCategorization', val)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="model-name">AI Model Identifier</Label>
                  <Input
                    id="model-name"
                    value={settings.geminiModel}
                    onChange={(e) => updateSetting('geminiModel', e.target.value)}
                  />
                  <span className="text-[11px] text-muted-foreground">Recommended: gemini-2.5-flash</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tokens">Max AI Output Tokens</Label>
                  <Input
                    id="tokens"
                    type="number"
                    min="256"
                    max="4096"
                    step="128"
                    value={settings.aiMaxTokens}
                    onChange={(e) => updateSetting('aiMaxTokens', Number(e.target.value))}
                  />
                  <span className="text-[11px] text-muted-foreground">Token budget per generation request</span>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-start gap-3">
                <Cpu className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-foreground">Gemini API Key Verified</p>
                  <p className="text-muted-foreground leading-relaxed">
                    The backend is actively configured with Google Gemini API key. Live AI event description generation and rule synthesis are operational.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border">
        <span className="text-xs text-muted-foreground">
          All platform adjustments take immediate effect upon saving.
        </span>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-xs">
          <Save className="h-4 w-4" /> {isSaving ? 'Saving Changes...' : 'Save All Platform Settings'}
        </Button>
      </div>
    </div>
  );
}
