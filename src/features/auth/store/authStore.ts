import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../../shared/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

interface AuthActions {
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
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
            login: async (email: string, password: string) => {
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    if (!response.ok) {
                        throw new Error('Login failed');
                    }

                    const data = await response.json();

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                    });

                    // Save token to localStorage
                    localStorage.setItem('auth_token', data.token);
                } catch (error) {
                    console.error('Login error:', error);
                    throw error;
                }
            },

            register: async (name: string, email: string, password: string) => {
                try {
                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, password }),
                    });

                    if (!response.ok) {
                        throw new Error('Registration failed');
                    }

                    const data = await response.json();

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                    });

                    localStorage.setItem('auth_token', data.token);
                } catch (error) {
                    console.error('Registration error:', error);
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
