import { api } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer' | 'admin';
  student_id?: string;
  department?: string;
  year?: number;
  phone?: string;
  profile_image?: string;
  bio?: string;
}

export const authService = {
  async login(data: any) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch('/users/me', data);
    return response.data;
  },
};
