import { create } from 'zustand';
import { User } from '@/lib/auth';
import { authService } from '@/lib/auth';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  loadUser: async () => {
    try {
      if (authService.isAuthenticated()) {
        const user = await authService.getMe();
        set({ user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },
  logout: async () => {
    await authService.logout();
    set({ user: null });
  },
}));

