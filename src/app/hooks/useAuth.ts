import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../lib/api';

export function useAuth() {
    const queryClient = useQueryClient();

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: authApi.getMe,
        retry: false,
        enabled: !!localStorage.getItem('token'),
        staleTime: 1000 * 60 * 5,
    });

    const loginMutation = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            authApi.login(email, password),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            queryClient.setQueryData(['auth', 'me'], data.user);
        },
    });

    const registerMutation = useMutation({
        mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
            authApi.register(name, email, password),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            queryClient.setQueryData(['auth', 'me'], data.user);
        },
    });

    const logout = () => {
        localStorage.removeItem('token');
        queryClient.setQueryData(['auth', 'me'], null);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
    };

    return {
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login: loginMutation,
        register: registerMutation,
        logout,
    };
}
