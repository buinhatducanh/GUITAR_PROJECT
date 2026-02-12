import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi, blogsApi, bannersApi, vouchersApi, eventsApi, landingPagesApi, ordersApi, type ProductsQuery } from '../lib/api';

// ─── Products ───────────────────────────────────

export function useProducts(params?: ProductsQuery) {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => productsApi.getAll(params),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export function useProduct(slug: string) {
    return useQuery({
        queryKey: ['product', slug],
        queryFn: () => productsApi.getBySlug(slug),
        enabled: !!slug,
    });
}

export function useFeaturedProducts() {
    return useQuery({
        queryKey: ['products', 'featured'],
        queryFn: () => productsApi.getAll({ featured: true, limit: 8 }),
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productsApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productsApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    });
}

// ─── Categories ─────────────────────────────────

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getTree,
        staleTime: 1000 * 60 * 10,
    });
}

export function useAllCategories() {
    return useQuery({
        queryKey: ['categories', 'all'],
        queryFn: categoriesApi.getAll,
        staleTime: 1000 * 60 * 10,
    });
}

// ─── Blog Posts ─────────────────────────────────

export function useBlogPosts(params?: { page?: number; category?: string; search?: string }) {
    return useQuery({
        queryKey: ['blogs', params],
        queryFn: () => blogsApi.getAll(params),
        staleTime: 1000 * 60 * 3,
    });
}

export function useBlogPost(slug: string) {
    return useQuery({
        queryKey: ['blog', slug],
        queryFn: () => blogsApi.getBySlug(slug),
        enabled: !!slug,
    });
}

// ─── Banners ────────────────────────────────────

export function useBanners() {
    return useQuery({
        queryKey: ['banners'],
        queryFn: bannersApi.getAll,
        staleTime: 1000 * 60 * 5,
    });
}

// ─── Vouchers ───────────────────────────────────

export function useVouchers() {
    return useQuery({
        queryKey: ['vouchers'],
        queryFn: vouchersApi.getAll,
        staleTime: 1000 * 60 * 3,
    });
}

export function useRedeemVoucher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: vouchersApi.redeem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vouchers'] });
            queryClient.invalidateQueries({ queryKey: ['auth'] });
        },
    });
}

// ─── Events ─────────────────────────────────────

export function useEvents() {
    return useQuery({
        queryKey: ['events'],
        queryFn: eventsApi.getAll,
        staleTime: 1000 * 60 * 5,
    });
}

// ─── Landing Pages ──────────────────────────────

export function useLandingPages() {
    return useQuery({
        queryKey: ['landing-pages'],
        queryFn: landingPagesApi.getPublished,
        staleTime: 1000 * 60 * 10,
    });
}

export function useLandingPage(slug: string) {
    return useQuery({
        queryKey: ['landing-page', slug],
        queryFn: () => landingPagesApi.getBySlug(slug),
        enabled: !!slug,
    });
}

// ─── Orders ─────────────────────────────────────

export function useOrders() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: ordersApi.getAll,
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ordersApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    });
}
