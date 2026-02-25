import { useQuery } from '@tanstack/react-query';
import { productsApi, ProductsQuery } from '@/app/lib/api';
import { queryKeys } from '@/app/lib/queryKeys';
import { Product } from '@/app/context/AppContext';

// Helper to map API response to AppContext Product type
const mapProduct = (p: any): Product => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
    discount: p.discount ?? undefined,
    image: p.image ?? '',
    category: typeof p.category === 'object' ? p.category?.name ?? '' : (p.category ?? ''),
    description: p.description ?? '',
    specs: Array.isArray(p.specs) ? p.specs : [],
    rating: p.rating ?? 0,
    reviews: [],
});

export const useProducts = (params?: ProductsQuery) => {
    return useQuery({
        queryKey: queryKeys.products.list(params),
        queryFn: async () => {
            const res = await productsApi.getAll(params);
            const mappedProducts = res.products.map(mapProduct);
            return {
                products: mappedProducts,
                pagination: res.pagination,
            };
        },
    });
};

export const useProductDetail = (slug: string) => {
    return useQuery({
        queryKey: queryKeys.products.detail(slug),
        queryFn: async () => {
            const p = await productsApi.getBySlug(slug);
            return mapProduct(p);
        },
        enabled: !!slug,
    });
};
