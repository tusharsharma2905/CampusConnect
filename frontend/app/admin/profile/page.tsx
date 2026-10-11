'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Mail, User as UserIcon, Key, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminProfilePage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your administrator account credentials and view permissions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarImage src={user?.profile_image} alt={user?.name} />
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{user?.name || 'Administrator'}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1.5 mt-1">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </CardDescription>
            <div className="pt-2 flex justify-center">
              <Badge className="bg-primary/90 text-primary-foreground gap-1 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Super Admin
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-sm text-muted-foreground space-y-3">
            <Separator />
            <div className="flex justify-between py-1">
              <span>Account Status</span>
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>Security Level</span>
              <span className="font-medium text-foreground">Tier 1 (Root)</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 gap-2"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        {/* Details and Privileges */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                Account Information
              </CardTitle>
              <CardDescription>Details associated with your administrator identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.name || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue={user?.email || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Platform Role</Label>
                <Input id="role" value="Platform Administrator (admin)" readOnly className="bg-muted/50 font-mono text-xs" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Administrative Privileges
              </CardTitle>
              <CardDescription>Authorized platform scopes assigned to this role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border">
                <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Event Approvals & Moderation</p>
                  <p className="text-xs text-muted-foreground">Review, approve, or reject draft events submitted by campus organizers.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border">
                <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">User & Role Management</p>
                  <p className="text-xs text-muted-foreground">Manage user accounts, toggle active statuses, and assign organizer privileges.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border">
                <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">System Overview & Analytics</p>
                  <p className="text-xs text-muted-foreground">Access platform-wide registration metrics and aggregate reporting.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
