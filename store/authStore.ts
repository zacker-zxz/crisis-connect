import { create } from 'zustand';

interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  role: 'ngo' | 'volunteer';
  skills?: string[];
  profileImageUrl?: string;
  availability?: {
    day: string;
    enabled: boolean;
    start: string;
    end: string;
  }[];
  location?: { lat: number; lng: number; address: string };
  organizationName?: string;
  publicDescription?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const persistUserSafely = (user: User) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch {
    // If storage quota is exceeded (for example by large base64 profile images),
    // persist a lightweight version and keep full user in in-memory state.
    const lightweightUser = { ...user, profileImageUrl: undefined };
    try {
      localStorage.setItem('user', JSON.stringify(lightweightUser));
    } catch {
      // Ignore persistence failures to avoid breaking UI updates.
    }
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      persistUserSafely(user);
    }
    set({ token, user });
  },
  updateUser: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      persistUserSafely(updatedUser);
      set({ user: updatedUser });
    }
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ token: null, user: null });
  },
}));
