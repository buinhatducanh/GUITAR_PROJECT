import { useQuery } from '@tanstack/react-query';
import { vouchersApi } from '@/app/lib/api';
import { queryKeys } from '@/app/lib/queryKeys';
import { Voucher } from '@/app/context/AppContext';

export const useMyVouchers = () => {
    return useQuery({
        queryKey: [...queryKeys.vouchers.all, 'mine'],
        queryFn: async () => {
            try {
                const res = await vouchersApi.getMyVouchers();
                return (Array.isArray(res) ? res : []) as Voucher[];
            } catch (error) {
                console.error('Failed to fetch my vouchers:', error);
                return [] as Voucher[];
            }
        },
    });
};
