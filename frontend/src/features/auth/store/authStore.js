import { create } from 'zustand';
import { loginApi, registerApi, getMeApi, refreshUserApi } from '../api/authApi';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await loginApi({ email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      set({ token, user, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await registerApi(data);
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      set({ token, user, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    if (!localStorage.getItem('token')) return;
    set({ loading: true });
    try {
      const res = await getMeApi();
      set({ user: res.data.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  refreshUser: async () => {
    set({ loading: true });
    try {
      const res = await refreshUserApi();
      set({ user: res.data.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
}));

export default useAuthStore;
