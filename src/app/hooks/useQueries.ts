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

export function useCreateBlog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: blogsApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
    });
}

export function useUpdateBlog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => blogsApi.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
    });
}

export function useDeleteBlog() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: blogsApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
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

export function useCreateBanner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bannersApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
    });
}

export function useUpdateBanner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => bannersApi.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
    });
}

export function useDeleteBanner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bannersApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
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

export function useCreateVoucher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: vouchersApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vouchers'] }),
    });
}

export function useUpdateVoucher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => vouchersApi.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vouchers'] }),
    });
}

export function useDeleteVoucher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: vouchersApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vouchers'] }),
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

export function useCreateEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eventsApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    });
}

export function useUpdateEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => eventsApi.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    });
}

export function useDeleteEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eventsApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
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

export function useAllLandingPages() {
    return useQuery({
        queryKey: ['landing-pages', 'all'],
        queryFn: landingPagesApi.getAll,
    });
}

export function useCreateLandingPage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: landingPagesApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
    });
}

export function useUpdateLandingPage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => landingPagesApi.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
    });
}

export function useDeleteLandingPage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: landingPagesApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
    });
}

// ─── Orders ─────────────────────────────────────

export function useOrders() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: ordersApi.getAll,
    });
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: ['order', id],
        queryFn: () => ordersApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ordersApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}
