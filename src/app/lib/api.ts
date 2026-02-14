const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ─── Helper ─────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
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

export interface CreateOrderPayload {
    items: { productId: string; name: string; price: number; quantity: number }[];
    address: string;
    phone: string;
    notes?: string;
    totalAmount: number;
}

export const ordersApi = {
    getAll: () => request<any[]>('/orders'),

    getById: (id: string) => request<any>(`/orders/${id}`),

    create: (data: CreateOrderPayload) =>
        request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),

    updateStatus: (id: string, status: string) =>
        request<any>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ─── Upload API ─────────────────────────────────

export const uploadApi = {
    getSignature: (folder?: string) =>
        request<{ signature: string; timestamp: number; folder: string; cloudName: string; apiKey: string }>(
            '/upload/signature',
            { method: 'POST', body: JSON.stringify({ folder }) }
        ),

    /** Upload file directly to Cloudinary using signed params */
    async uploadToCloudinary(file: File, folder = 'guitar-nova/general'): Promise<string> {
        const sig = await this.getSignature(folder);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('timestamp', String(sig.timestamp));
        formData.append('signature', sig.signature);
        formData.append('folder', sig.folder);
        formData.append('api_key', sig.apiKey);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
            { method: 'POST', body: formData }
        );

        const data = await res.json();
        return data.secure_url;
    },
};
