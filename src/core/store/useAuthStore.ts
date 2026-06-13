import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string, exhibitorData?: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,

  setToken: async (token: string, exhibitorData?: any) => {
    await SecureStore.setItemAsync('exhibitorToken', token);
    if (exhibitorData) {
      await SecureStore.setItemAsync('exhibitorData', JSON.stringify(exhibitorData));
    }
    set({ token, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('exhibitorToken');
    await SecureStore.deleteItemAsync('exhibitorData');
    set({ token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = await SecureStore.getItemAsync('exhibitorToken');
    if (token) {
      set({ token, isAuthenticated: true });
    } else {
      set({ token: null, isAuthenticated: false });
    }
  },
}));
