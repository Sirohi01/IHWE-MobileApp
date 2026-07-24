import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/core/config/env';

export { API_URL };

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('exhibitorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      await SecureStore.deleteItemAsync('exhibitorToken');
      // If you are using expo-router, you could import router and do: router.replace('/login') here
    }
    return Promise.reject(error);
  }
);
