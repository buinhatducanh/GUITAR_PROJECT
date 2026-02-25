export const queryKeys = {
    products: {
        all: ['products'] as const,
        list: (params?: any) => ['products', params] as const,
        detail: (slug: string) => ['products', 'detail', slug] as const,
    },
    blogs: {
        all: ['blogs'] as const,
        list: (params?: any) => ['blogs', params] as const,
        detail: (slug: string) => ['blogs', 'detail', slug] as const,
    },
    banners: {
        all: ['banners'] as const,
        admin: ['banners', 'admin'] as const,
    },
    events: {
        all: ['events'] as const,
    },
    vouchers: {
        all: ['vouchers'] as const,
    },
    categories: {
        all: ['categories'] as const,
        tree: ['categories', 'tree'] as const,
    },
} as const;
