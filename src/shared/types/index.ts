// ─── Domain Types ────────────────────────────────

export interface Product {
    id: string;
    name: string;
    price: number;
    oldPrice?: number;
    discount?: number;
    image: string;
    category: string;
    description: string;
    specs: string[];
    rating: number;
    reviews: Review[];
}

export interface Review {
    id: string;
    userId: string;
    user: string;
    avatar: string;
    productId: string;
    productName: string;
    rating: number;
    comment: string;
    date: string;
    images?: string[];
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Banner {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    link: string;
}

export interface User {
    id: string;
    name: string;
    email?: string;
    phone: string;
    avatar: string;
    points: number;
    joinDate: string;
    totalOrders: number;
    totalSpent: number;
    lastLogin: string;
    role?: 'USER' | 'ADMIN';
    googleId?: string;
}

export interface Voucher {
    id: string;
    code: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    pointsCost: number;
    minPurchase: number;
    maxDiscount?: number;
    expiryDate: string;
    isActive: boolean;
    image: string;
    usageLimit: number;
    usedCount: number;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    type: 'login_streak' | 'purchase_couple' | 'special_day' | 'first_purchase' | 'referral';
    reward: {
        type: 'points' | 'discount' | 'voucher';
        value: number;
        voucherId?: string;
    };
    conditions: {
        days?: number;
        minPurchase?: number;
        specificDate?: string;
        requireCoupleCode?: boolean;
    };
    startDate: string;
    endDate: string;
    isActive: boolean;
    image: string;
    progress?: number;
}

export interface LandingPageData {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    sections: {
        type: 'hero' | 'content' | 'gallery' | 'cta';
        title?: string;
        content?: string;
        images?: string[];
        buttonText?: string;
        buttonLink?: string;
    }[];
    isPublished: boolean;
    createdAt: string;
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    author: {
        name: string;
        avatar: string;
    };
    category: string;
    tags: string[];
    publishedDate: string;
    readTime: number;
    views: number;
    isPublished: boolean;
}

export interface UserData {
    id: string;
    name: string;
    email: string;
    avatar: string;
    points: number;
    joinDate: string;
    totalOrders: number;
    totalSpent: number;
    lastLogin: string;
    status: 'active' | 'inactive';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}


