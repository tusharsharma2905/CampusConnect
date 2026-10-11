'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  Mail, 
  User as UserIcon, 
  BookOpen, 
  Phone, 
  Calendar, 
  LogOut, 
  Save, 
  CheckCircle2, 
  Loader2,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function StudentProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    department: '',
    year: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        student_id: user.student_id || '',
        department: user.department || '',
        year: user.year ? String(user.year) : '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
      toast.success('Profile updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update profile.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: formData.name,
      student_id: formData.student_id || undefined,
      department: formData.department || undefined,
      year: formData.year ? parseInt(formData.year, 10) : undefined,
      phone: formData.phone || undefined,
      bio: formData.bio || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    : 'ST';

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your academic profile and personal information.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Avatar & Summary Card */}
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
            <CardTitle className="text-xl">{user?.name || 'Student'}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1.5 mt-1">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </CardDescription>
            <div className="pt-2 flex justify-center">
              <Badge className="bg-primary/90 text-primary-foreground gap-1 px-3 py-1">
                <GraduationCap className="h-3.5 w-3.5" />
                Student
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-sm text-muted-foreground space-y-3">
            <Separator />
            <div className="flex justify-between py-1">
              <span>Student ID</span>
              <span className="font-medium text-foreground">{user?.student_id || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Department</span>
              <span className="font-medium text-foreground">{user?.department || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Academic Year</span>
              <span className="font-medium text-foreground">{user?.year ? `Year ${user.year}` : 'Not set'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Account Status</span>
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active
              </span>
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

        {/* Right Side: Edit Profile Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Personal & Academic Details
                </CardTitle>
                <CardDescription>Update your contact and campus information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Your college email address cannot be changed.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="student_id" className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                      Student Roll / ID
                    </Label>
                    <Input
                      id="student_id"
                      placeholder="e.g. 23BCON1893"
                      value={formData.student_id}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department" className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      Department / Major
                    </Label>
                    <Input
                      id="department"
                      placeholder="e.g. Computer Science"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="year" className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Current Year (1 - 5)
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      min="1"
                      max="5"
                      placeholder="e.g. 3"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio" className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Bio & Technical Interests
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your campus interests, tech stack, or clubs..."
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-2 border-t">
                <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
