import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  // Multi-event support: which ExhibitorRegistration (event) the exhibitor is
  // currently viewing, when they've registered for more than one event. Null
  // means "use whatever the backend defaults to" (most recently created).
  selectedRegId: string | null;
  setToken: (token: string, exhibitorData?: any) => Promise<void>;
  setSelectedRegId: (regId: string | null) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  selectedRegId: null,

  setToken: async (token: string, exhibitorData?: any) => {
    await SecureStore.setItemAsync('exhibitorToken', token);
    if (exhibitorData) {
      await SecureStore.setItemAsync('exhibitorData', JSON.stringify(exhibitorData));
    }
    set({ token, isAuthenticated: true });
  },

  setSelectedRegId: async (regId: string | null) => {
    if (regId) {
      await SecureStore.setItemAsync('exhibitorSelectedRegId', regId);
    } else {
      await SecureStore.deleteItemAsync('exhibitorSelectedRegId');
    }
    set({ selectedRegId: regId });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('exhibitorToken');
    await SecureStore.deleteItemAsync('exhibitorData');
    await SecureStore.deleteItemAsync('exhibitorSelectedRegId');
    set({ token: null, isAuthenticated: false, selectedRegId: null });
  },

  checkAuth: async () => {
    const token = await SecureStore.getItemAsync('exhibitorToken');
    const selectedRegId = await SecureStore.getItemAsync('exhibitorSelectedRegId');
    if (token) {
      set({ token, isAuthenticated: true, selectedRegId: selectedRegId || null });
    } else {
      set({ token: null, isAuthenticated: false, selectedRegId: null });
    }
  },
}));
