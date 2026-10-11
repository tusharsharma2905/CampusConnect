import { api } from '@/lib/api';

export const adminService = {
  async getPlatformStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getUsers(params?: any) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async manageUser(userId: string, action: string) {
    const response = await api.patch(`/admin/users/${userId}/manage`, { action });
    return response.data;
  },

  async approveEvent(eventId: string) {
    const response = await api.patch(`/events/${eventId}/approve`);
    return response.data;
  },
  
  async getEvents(params?: any) {
    const response = await api.get('/events', { params });
    return response.data;
  }
};
