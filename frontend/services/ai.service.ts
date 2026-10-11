import { api } from '@/lib/api';

export const aiService = {
  async generateContent(prompt: string, context?: string) {
    const response = await api.post('/ai/generate', { prompt, context });
    return response.data;
  },

  async getSuggestions(interests: string[], pastEvents: string[]) {
    const response = await api.post('/ai/suggestions', { interests, past_events: pastEvents });
    return response.data;
  }
};
