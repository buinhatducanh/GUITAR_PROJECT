import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../../../shared/types';
import { authApi } from '@/app/lib/api';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}
//ss
interface AuthActions {
    login: (phone: string, password: string) => Promise<void>;
    register: (name: string, phone: string, password: string) => Promise<void>;
    googleLogin: (credential: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
    updatePoints: (points: number) => void;
    updateProfile: (data: { name: string; email: string }) => void;
    refreshUser: () => Promise<void>;
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
                    const response = await authApi.login(phone, password);
                    const { user, token } = response;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    console.error('Login error:', error);
                    throw error;
                }
            },

            register: async (name: string, phone: string, password: string) => {
                try {
                    const response = await authApi.register(name, phone, password);
                    const { user, token } = response;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    console.error('Registration error:', error);
                    throw error;
                }
            },

            googleLogin: async (credential: string) => {
                try {
                    const response = await authApi.googleLogin(credential);
                    const { user, token } = response;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                    });
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
                // Clear the legacy auth_token to ensure full cleanup
                sessionStorage.removeItem('auth_token');
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

            updateProfile: (data: { name: string; email: string }) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: {
                            ...currentUser,
                            name: data.name,
                            email: data.email,
                        },
                    });
                }
            },

            refreshUser: async () => {
                try {
                    const user = await authApi.getMe();
                    if (user) {
                        set({ user, isAuthenticated: true });
                    }
                } catch (error: any) {
                    console.error('Refresh user error:', error);
                    // Logout/clear auth state if getMe fails (e.g., 401 Unauthorized or token expired)
                    get().logout();
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
