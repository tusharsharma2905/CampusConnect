import { api } from '@/lib/api';
import { Event } from './event.service';

export interface Registration {
  id: string;
  registration_id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'cancelled' | 'attended' | 'waitlisted';
  registered_at: string;
  cancelled_at?: string;
  event?: Event;
}

export const registrationService = {
  async getMyRegistrations(): Promise<Registration[]> {
    const response = await api.get('/registrations/me');
    return response.data;
  },

  async registerForEvent(eventId: string, customData?: any): Promise<{ registration_id: string, qr_token: string }> {
    const response = await api.post(`/events/${eventId}/register`, { custom_data: customData });
    return response.data;
  },

  async cancelRegistration(registrationId: string): Promise<void> {
    await api.delete(`/registrations/${registrationId}`);
  }
};
