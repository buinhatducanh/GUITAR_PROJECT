import { useQuery } from '@tanstack/react-query';
import { vouchersApi } from '@/app/lib/api';
import { queryKeys } from '@/app/lib/queryKeys';
import { Voucher } from '@/app/context/AppContext';

export const useVouchers = () => {
    return useQuery({
        queryKey: queryKeys.vouchers.all,
        queryFn: async () => {
            const res = await vouchersApi.getAll();
            return (Array.isArray(res) ? res : []) as Voucher[];
        },
    });
};
