import { api } from '@/lib/api';

export const organizerService = {
  async getEventAnalytics(eventId: string) {
    const response = await api.get(`/analytics/events/${eventId}`);
    return response.data;
  },

  async scanAttendance(qrToken: string) {
    const response = await api.post(`/attendance/scan`, { qr_token: qrToken });
    return response.data;
  },

  async getMyEvents() {
    const response = await api.get('/events/organizer/my?limit=100');
    return response.data;
  }
};
