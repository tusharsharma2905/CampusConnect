import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is 401 Unauthorized
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Only redirect if the user is trying to access a protected dashboard route
        const protectedRoutes = ['/student', '/organizer', '/admin'];
        const isProtected = protectedRoutes.some(route => window.location.pathname.startsWith(route));
        
        if (isProtected) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
