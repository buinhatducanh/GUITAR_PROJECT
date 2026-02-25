import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../../shared/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

interface AuthActions {
    login: (phone: string, password: string) => Promise<void>;
    register: (name: string, phone: string, password: string) => Promise<void>;
    googleLogin: (credential: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
    updatePoints: (points: number) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,

            // Actions
            login: async (phone: string, password: string) => {
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone, password }),
                    });

                    if (!response.ok) {
                        throw new Error('Login failed');
                    }

                    const json = await response.json();
                    const { user, token } = json.data ?? json;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                    });

                    // Save token to localStorage
                    localStorage.setItem('auth_token', token);
                } catch (error) {
                    console.error('Login error:', error);
                    throw error;
                }
            },

            register: async (name: string, phone: string, password: string) => {
                try {
                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, phone, password }),
                    });

                    if (!response.ok) {
                        throw new Error('Registration failed');
                    }

                    const json = await response.json();
                    const { user, token } = json.data ?? json;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                    });

                    localStorage.setItem('auth_token', token);
                } catch (error) {
                    console.error('Registration error:', error);
                    throw error;
                }
            },

            googleLogin: async (credential: string) => {
                try {
                    const response = await fetch('/api/auth/google', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ credential }),
                    });

                    if (!response.ok) {
                        throw new Error('Google Login failed');
                    }

                    const json = await response.json();
                    const { user, token } = json.data ?? json;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                    });

                    localStorage.setItem('auth_token', token);
                } catch (error) {
                    console.error('Google Login error:', error);
                    throw error;
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
                localStorage.removeItem('auth_token');
            },

            setUser: (user: User | null) => {
                set({
                    user,
                    isAuthenticated: !!user,
                });
            },

            updatePoints: (points: number) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: {
                            ...currentUser,
                            points: currentUser.points + points,
                        },
                    });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
