import { api } from '@/lib/api';

export interface Event {
  id: string;
  slug: string;
  title: string;
  short_description?: string;
  description?: string;
  category_id?: string;
  venue_id?: string;
  organizer_id: string;
  banner_image?: string;
  event_type: 'online' | 'offline' | 'hybrid';
  start_datetime: string;
  end_datetime: string;
  registration_deadline?: string;
  capacity?: number;
  registration_count: number;
  eligibility?: string;
  rules?: string;
  prizes?: string;
  faq?: any;
  speakers?: any[];
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'cancelled' | 'completed';
  is_featured: boolean;
  online_link?: string;
  created_at: string;
  updated_at: string;
  category?: any;
  venue?: any;
  organizer?: any;
}

export interface PaginatedEvents {
  items: Event[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const eventService = {
  async getEvents(params: any): Promise<PaginatedEvents> {
    const response = await api.get('/events', { params });
    return response.data;
  },

  async getEvent(id: string): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  async createEvent(data: any): Promise<Event> {
    const response = await api.post('/events', data);
    return response.data;
  },

  async updateEvent(id: string, data: any): Promise<Event> {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  async cancelEvent(id: string): Promise<Event> {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  }
};
