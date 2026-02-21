const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ─── Helper ─────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers,
        },
        ...options,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Lỗi không xác định' }));
        throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
}

// ─── Auth API ───────────────────────────────────

export const authApi = {
    login: (email: string, password: string) =>
        request<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (name: string, email: string, password: string) =>
        request<{ user: any; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        }),

    getMe: () => request<any>('/auth/me'),
};

// ─── Products API ───────────────────────────────

export interface ProductsQuery {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    order?: string;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
}

export const productsApi = {
    getAll: (params?: ProductsQuery) => {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.set(key, String(value));
                }
            });
        }
        const query = searchParams.toString();
        return request<{ products: any[]; pagination: any }>(`/products${query ? `?${query}` : ''}`);
    },

    getBySlug: (slug: string) => request<any>(`/products/${slug}`),

    create: (data: any) =>
        request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
        request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
        request<any>(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Categories API ─────────────────────────────

export const categoriesApi = {
    getTree: () => request<any[]>('/categories'),
    getAll: () => request<any[]>('/categories/all'),

    create: (data: any) =>
        request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
        request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
        request<any>(`/categories/${id}`, { method: 'DELETE' }),
};

// ─── Blogs API ──────────────────────────────────

export const blogsApi = {
    getAll: (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.set(key, String(value));
            });
        }
        const query = searchParams.toString();
        return request<{ posts: any[]; pagination: any }>(`/blogs${query ? `?${query}` : ''}`);
    },

    getBySlug: (slug: string) => request<any>(`/blogs/${slug}`),

    create: (data: any) =>
        request<any>('/blogs', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
        request<any>(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
        request<any>(`/blogs/${id}`, { method: 'DELETE' }),
};

// ─── Banners API ────────────────────────────────

export const bannersApi = {
    getAll: () => request<any[]>('/banners'),
    getAllAdmin: () => request<any[]>('/banners?all=true'),

    create: (data: any) =>
        request<any>('/banners', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
        request<any>(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
        request<any>(`/banners/${id}`, { method: 'DELETE' }),
};

// ─── Vouchers API ───────────────────────────────

export const vouchersApi = {
    getAll: () => request<any[]>('/vouchers'),

    create: (data: any) =>
        request<any>('/vouchers', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
        request<any>(`/vouchers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
        request<any>(`/vouchers/${id}`, { method: 'DELETE' }),

    redeem: (id: string) =>
        request<any>(`/vouchers/${id}/redeem`, { method: 'POST' }),
};

// ─── Events API ─────────────────────────────────

export const eventsApi = {
    getAll: () => request<any[]>('/events'),

    create: (data: any) =>
        request<any>('/events', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
        request<any>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
        request<any>(`/events/${id}`, { method: 'DELETE' }),
};

// ─── Landing Pages API ──────────────────────────

export const landingPagesApi = {
    getPublished: () => request<any[]>('/landing-pages'),
    getAll: () => request<any[]>('/landing-pages/all'),
    getBySlug: (slug: string) => request<any>(`/landing-pages/${slug}`),

    create: (data: any) =>
        request<any>('/landing-pages', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
        request<any>(`/landing-pages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
        request<any>(`/landing-pages/${id}`, { method: 'DELETE' }),
};

// ─── Orders API ─────────────────────────────────

export const ordersApi = {
    getAll: () => request<any[]>('/orders'),

    create: (data: { items: any[]; address: string; phone: string; notes?: string; totalAmount: number }) =>
        request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),

    updateStatus: (id: string, status: string) =>
        request<any>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ─── Upload API ─────────────────────────────────

interface UploadSignatureResponse {
    signature: string;
    timestamp: number;
    folder: string;
    cloudName: string;
    apiKey: string;
    publicId?: string;
    overwrite?: boolean;
    uniqueFilename?: boolean;
}

/** Compute SHA-256 hash of a File for deduplication */
async function computeFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const uploadApi = {
    getSignature: (folder?: string, hash?: string) =>
        request<UploadSignatureResponse>(
            '/upload/signature',
            { method: 'POST', body: JSON.stringify({ folder, hash }) }
        ),

    /**
     * Upload file directly to Cloudinary using signed params.
     * Deduplicate: computes SHA-256 of file content and uses
     * it as public_id so identical files are not uploaded twice.
     */
    async uploadToCloudinary(file: File, folder = 'guitar-nova/general'): Promise<string> {
        const hash = await computeFileHash(file);
        const sig = await this.getSignature(folder, hash);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('timestamp', String(sig.timestamp));
        formData.append('signature', sig.signature);
        formData.append('folder', sig.folder);
        formData.append('api_key', sig.apiKey);

        if (sig.publicId) {
            formData.append('public_id', sig.publicId);
            formData.append('overwrite', 'false');
            formData.append('unique_filename', 'false');
        }

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
            { method: 'POST', body: formData }
        );

        const data = await res.json();
        return data.secure_url;
    },
};

// ─── Brands API ──────────────────────────────────

export const brandsApi = {
    getAll: () => request<{ brands: any[] }>('/brands'),

    create: (data: any) =>
        request<any>('/brands', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
        request<any>(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
        request<any>(`/brands/${id}`, { method: 'DELETE' }),
};

// ─── Shipping API ────────────────────────────────

export const shippingApi = {
    getAdminAll: () => request<{ shippingMethods: any[] }>('/shipping/admin/all'),

    create: (data: any) =>
        request<any>('/shipping', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: any) =>
        request<any>(`/shipping/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
        request<any>(`/shipping/${id}`, { method: 'DELETE' }),

    toggle: (id: string) =>
        request<any>(`/shipping/${id}/toggle`, { method: 'PATCH' }),
};

// ─── Inventory API ───────────────────────────────

export const inventoryApi = {
    getOverview: () => request<any>('/inventory'),

    getLowStock: () => request<{ products: any[] }>('/inventory/low-stock'),

    getOutOfStock: () => request<{ products: any[] }>('/inventory/out-of-stock'),

    adjust: (productId: string, quantity: number, type: string, notes?: string) =>
        request<any>('/inventory/adjust', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity, type, notes }),
        }),

    bulkUpdate: (items: { productId: string; stock: number }[]) =>
        request<any>('/inventory/bulk-update', {
            method: 'POST',
            body: JSON.stringify({ items }),
        }),
};

// ─── Settings API ────────────────────────────────

export const settingsApi = {
    get: () => request<any>('/settings'),

    update: (data: any) =>
        request<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Analytics API ───────────────────────────────

export const analyticsApi = {
    getOverview: (period = 'month') => request<any>(`/analytics/overview?period=${period}`),

    getRevenue: (period: string) =>
        request<any>(`/analytics/revenue?period=${period}`),

    getProducts: () => request<any>('/analytics/products'),

    getCustomers: () => request<any>('/analytics/customers'),

    getCategories: () => request<any>('/analytics/categories'),
};
