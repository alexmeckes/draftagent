import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userId');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  connectSleeper: async (username: string) => {
    const response = await api.post('/auth/sleeper-connect', { username });
    return response.data;
  },
  
  getSession: async () => {
    const response = await api.get('/auth/session');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('userId');
    return response.data;
  },
};

export const draftsApi = {
  getActiveDrafts: async () => {
    const response = await api.get('/drafts/active');
    return response.data;
  },
  
  getDraft: async (draftId: string) => {
    const response = await api.get(`/drafts/${draftId}`);
    return response.data;
  },
  
  getDraftPicks: async (draftId: string) => {
    const response = await api.get(`/drafts/${draftId}/picks`);
    return response.data;
  },
  
  analyzePlayer: async (draftId: string, playerId: string) => {
    const response = await api.post(`/drafts/${draftId}/analyze-player`, { playerId });
    return response.data;
  },

  api, // Export the api instance for direct use
};