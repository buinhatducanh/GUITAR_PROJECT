import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/app/lib/api';
import { queryKeys } from '@/app/lib/queryKeys';

export const useCategoriesTree = () => {
    return useQuery({
        queryKey: queryKeys.categories.tree,
        queryFn: async () => {
            const res = await categoriesApi.getTree();
            return Array.isArray(res) ? res : [];
        },
    });
};

export const useAllCategories = () => {
    return useQuery({
        queryKey: queryKeys.categories.all,
        queryFn: async () => {
            const res = await categoriesApi.getAll();
            return Array.isArray(res) ? res : [];
        },
    });
};
