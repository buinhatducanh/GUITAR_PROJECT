import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore';

export interface Product {
  id: string;
  name: string;
  slug: string;
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
  order: number;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  points: number;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  lastLogin: string;
  role?: 'USER' | 'ADMIN';
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
  isUsed?: boolean;
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
  authorName: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  publishedDate: string | null;
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

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  banners: Banner[];
  setBanners: (banners: Banner[]) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  vouchers: Voucher[];
  setVouchers: (vouchers: Voucher[]) => void;
  events: Event[];
  setEvents: (events: Event[]) => void;
  userVouchers: string[];
  redeemVoucher: (voucherId: string) => void;
  addPoints: (points: number) => void;
  landingPages: LandingPageData[];
  setLandingPages: (pages: LandingPageData[]) => void;
  users: UserData[];
  setUsers: (users: UserData[]) => void;
  allReviews: Review[];
  setAllReviews: (reviews: Review[]) => void;
  blogPosts: BlogPost[];
  setBlogPosts: (posts: BlogPost[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [userVouchers, setUserVouchers] = useState<string[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPageData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Sync authStore user to AppContext user
  const authStoreUser = useAuthStore((state) => state.user);
  useEffect(() => {
    setUser(authStoreUser as User | null);
  }, [authStoreUser]);

  // Initialize login streak tracking
  useEffect(() => {
    if (user) {
      const today = new Date().toDateString();
      const lastLogin = localStorage.getItem('lastLogin');

      if (lastLogin !== today) {
        localStorage.setItem('lastLogin', today);

        const streakCount = parseInt(localStorage.getItem('loginStreak') || '0') + 1;
        localStorage.setItem('loginStreak', streakCount.toString());

        if (streakCount === 7) {
          addPoints(1000);
          localStorage.setItem('loginStreak', '0');
        }
      }
    }
  }, [user]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const redeemVoucher = (voucherId: string) => {
    const voucher = vouchers.find(v => v.id === voucherId);
    if (voucher && user && user.points >= voucher.pointsCost) {
      setUser({ ...user, points: user.points - voucher.pointsCost });
      setUserVouchers([...userVouchers, voucherId]);
    }
  };

  const addPoints = (points: number) => {
    if (user) {
      setUser({ ...user, points: user.points + points });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        products,
        setProducts,
        banners,
        setBanners,
        currentPage,
        setCurrentPage,
        isCartOpen,
        setIsCartOpen,
        vouchers,
        setVouchers,
        events,
        setEvents,
        userVouchers,
        redeemVoucher,
        addPoints,
        landingPages,
        setLandingPages,
        users,
        setUsers,
        allReviews,
        setAllReviews,
        blogPosts,
        setBlogPosts
      }}
    >
      {children}
    </AppContext.Provider>
  );
};