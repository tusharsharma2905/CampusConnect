'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MoreHorizontal, Shield, User as UserIcon, Building2 } from 'lucide-react';
import { toast } from 'sonner';

import { adminService } from '@/services/admin.service';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function UserManagementPage() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers(),
  });

  const manageMutation = useMutation({
    mutationFn: ({ userId, action }: { userId: string, action: string }) => 
      adminService.manageUser(userId, action),
    onSuccess: (_, variables) => {
      toast.success(`User ${variables.action}d successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to manage user');
    }
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-primary" />;
      case 'organizer': return <Building2 className="h-4 w-4 text-amber-500" />;
      default: return <UserIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all registered accounts.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users by name or email..." className="pl-9" />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32">Loading users...</TableCell>
              </TableRow>
            ) : !users || users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 capitalize">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={user.is_active} 
                        onCheckedChange={(checked) => {
                          manageMutation.mutate({ 
                            userId: user.id, 
                            action: checked ? 'activate' : 'deactivate' 
                          });
                        }}
                        disabled={user.role === 'admin'} // Prevent self-deactivation ideally
                      />
                      <Badge variant={user.is_active ? 'default' : 'secondary'} className={user.is_active ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20' : ''}>
                        {user.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Popover>
                      <PopoverTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                        <MoreHorizontal className="h-4 w-4" />
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2" align="end">
                        <Button variant="ghost" className="w-full justify-start text-sm h-8" disabled>
                          Edit Role
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm h-8" disabled>
                          Reset Password
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-sm h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={user.role === 'admin'}
                          onClick={() => {
                            if (confirm('Are you sure you want to permanently delete this user?')) {
                              manageMutation.mutate({ userId: user.id, action: 'delete' });
                            }
                          }}
                        >
                          Delete Account
                        </Button>
                      </PopoverContent>
                    </Popover>
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
