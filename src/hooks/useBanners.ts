import { useQuery } from '@tanstack/react-query';
import { bannersApi } from '@/app/lib/api';
import { queryKeys } from '@/app/lib/queryKeys';

export const useBanners = () => {
    return useQuery({
        queryKey: queryKeys.banners.all,
        queryFn: async () => {
            const res = await bannersApi.getAll();
            return Array.isArray(res) ? res : [];
        },
    });
};

export const useAdminBanners = () => {
    return useQuery({
        queryKey: queryKeys.banners.admin,
        queryFn: async () => {
            const res = await bannersApi.getAllAdmin();
            return Array.isArray(res) ? res : [];
        },
    });
};
