import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Fender Stratocaster American Professional II',
    price: 45900000,
    oldPrice: 52000000,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1763162603999-8a1958b13cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhciUyMHByZW1pdW0lMjB3b29kfGVufDF8fHx8MTc3MDQxMTY3NXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Electric Guitar',
    description: 'Guitar điện cao cấp với âm thanh đặc trưng Fender. Thiết kế classic với công nghệ hiện đại.',
    specs: ['Body: Alder', 'Neck: Maple', 'Fretboard: Rosewood', 'Pickups: V-Mod II Single-Coil'],
    rating: 4.9,
    reviews: []
  },
  {
    id: '2',
    name: 'Gibson Les Paul Standard 60s',
    price: 68500000,
    oldPrice: 75000000,
    discount: 9,
    image: 'https://images.unsplash.com/photo-1692501735268-30251c6a30e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZ3VpdGFyJTIwY29sbGVjdGlvbnxlbnwxfHx8fDE3NzA0MTE2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Electric Guitar',
    description: 'Biểu tượng của rock với âm thanh ấm áp, thick và sustain tuyệt vời.',
    specs: ['Body: Mahogany', 'Top: Maple', 'Neck: Mahogany', 'Pickups: BurstBucker 61'],
    rating: 5.0,
    reviews: []
  },
  {
    id: '3',
    name: 'Yamaha FG800 Acoustic',
    price: 8900000,
    oldPrice: 10500000,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1763162603999-8a1958b13cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhciUyMHByZW1pdW0lMjB3b29kfGVufDF8fHx8MTc3MDQxMTY3NXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Acoustic Guitar',
    description: 'Guitar acoustic phổ biến nhất cho người mới bắt đầu và chuyên nghiệp.',
    specs: ['Top: Solid Spruce', 'Back/Sides: Nato', 'Neck: Nato', 'Finish: Natural'],
    rating: 4.7,
    reviews: []
  },
  {
    id: '4',
    name: 'Fender Precision Bass',
    price: 42000000,
    image: 'https://images.unsplash.com/photo-1695192577284-fd1b10529579?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNzJTIwZ3VpdGFyJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDQxMTY3NXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Bass Guitar',
    description: 'Bass guitar legendary với âm thanh punchy và định nghĩa rõ ràng.',
    specs: ['Body: Alder', 'Neck: Maple', 'Fretboard: Pau Ferro', 'Pickups: Split Single-Coil'],
    rating: 4.8,
    reviews: []
  },
  {
    id: '5',
    name: 'Marshall DSL40CR Amplifier',
    price: 24500000,
    oldPrice: 28000000,
    discount: 13,
    image: 'https://images.unsplash.com/photo-1565829073670-cd08d8c63643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBhbXBsaWZpZXIlMjBzdHVkaW8lMjB2aW50YWdlfGVufDF8fHx8MTc3MDQxMTY3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Amplifier',
    description: 'Ampli all-tube 40W với classic Marshall tone và hiệu ứng reverb.',
    specs: ['Power: 40W', 'Channels: 2', 'Effects: Reverb', 'Speaker: 12" Celestion'],
    rating: 4.9,
    reviews: []
  },
  {
    id: '6',
    name: 'Boss GT-1000 Effects Processor',
    price: 18900000,
    image: 'https://images.unsplash.com/photo-1662434243640-42988ab42db8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBwZWRhbCUyMGVmZmVjdHMlMjBib2FyZHxlbnwxfHx8fDE3NzA0MTE2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Effects',
    description: 'Bộ xử lý hiệu ứng flagship với công nghệ AIRD và amp modeling.',
    specs: ['DSP: BOSS flagship', 'Presets: 250+', 'Effects: 200+', 'Interface: USB Audio'],
    rating: 4.8,
    reviews: []
  },
  {
    id: '7',
    name: "D'Addario NYXL Strings",
    price: 280000,
    oldPrice: 350000,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1674485146230-d654464e477c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBzdHJpbmdzJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzA0MTE2NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Accessories',
    description: 'Dây đàn cao cấp với độ bền gấp đôi và tuning stability tốt nhất.',
    specs: ['Gauge: 10-46', 'Material: Nickel Wound', 'Core: High Carbon Steel', 'Coating: NYXL'],
    rating: 4.6,
    reviews: []
  },
  {
    id: '8',
    name: 'Taylor 814ce Grand Auditorium',
    price: 89000000,
    oldPrice: 95000000,
    discount: 6,
    image: 'https://images.unsplash.com/photo-1741701862902-01b463d10435?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0dWRpbyUyMGd1aXRhciUyMHdhbGx8ZW58MXx8fHwxNzcwNDExNjc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Acoustic Guitar',
    description: 'Acoustic guitar cao cấp với âm thanh cân bằng hoàn hảo.',
    specs: ['Top: Solid Sitka Spruce', 'Back/Sides: Indian Rosewood', 'Electronics: ES2', 'Cutaway: Venetian'],
    rating: 5.0,
    reviews: []
  }
];

const initialBanners: Banner[] = [
  {
    id: 'b1',
    image: 'https://images.unsplash.com/photo-1626406512368-ae4ad84da00f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBtdXNpY2lhbiUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NzA0MTE2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Bộ Sưu Tập Mới 2026',
    subtitle: 'Khám phá các mẫu guitar premium mới nhất từ các thương hiệu hàng đầu thế giới',
    link: '/landing/collection-2026'
  },
  {
    id: 'b2',
    image: 'https://images.unsplash.com/photo-1692501735268-30251c6a30e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZ3VpdGFyJTIwY29sbGVjdGlvbnxlbnwxfHx8fDE3NzA0MTE2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Giảm Giá Đến 30%',
    subtitle: 'Sale lớn nhất năm - Đừng bỏ lỡ cơ hội sở hữu guitar mơ ước',
    link: '/promo'
  },
  {
    id: 'b3',
    image: 'https://images.unsplash.com/photo-1741701862902-01b463d10435?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0dWRpbyUyMGd1aXRhciUyMHdhbGx8ZW58MXx8fHwxNzcwNDExNjc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Thương Hiệu Guitar NOVA',
    subtitle: 'Hơn 10 năm mang âm nhạc đến gần hơn với bạn',
    link: '/landing/about'
  }
];

const initialVouchers: Voucher[] = [
  {
    id: 'v1',
    code: 'NOVA500K',
    title: 'Giảm 500K cho đơn hàng',
    description: 'Áp dụng cho đơn hàng từ 5 triệu',
    discountType: 'fixed',
    discountValue: 500000,
    pointsCost: 1000,
    minPurchase: 5000000,
    expiryDate: '2026-03-31',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400',
    usageLimit: 100,
    usedCount: 23
  },
  {
    id: 'v2',
    code: 'NOVA15',
    title: 'Giảm 15% đơn hàng',
    description: 'Giảm tối đa 2 triệu cho mọi đơn hàng',
    discountType: 'percentage',
    discountValue: 15,
    pointsCost: 1500,
    minPurchase: 0,
    maxDiscount: 2000000,
    expiryDate: '2026-04-30',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?w=400',
    usageLimit: 50,
    usedCount: 12
  },
  {
    id: 'v3',
    code: 'FREESHIP',
    title: 'Miễn phí vận chuyển',
    description: 'Free ship toàn quốc mọi đơn hàng',
    discountType: 'fixed',
    discountValue: 50000,
    pointsCost: 500,
    minPurchase: 0,
    expiryDate: '2026-05-31',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400',
    usageLimit: 200,
    usedCount: 89
  },
  {
    id: 'v4',
    code: 'PREMIUM20',
    title: 'Giảm 20% cho sản phẩm cao cấp',
    description: 'Áp dụng cho guitar trên 30 triệu',
    discountType: 'percentage',
    discountValue: 20,
    pointsCost: 2500,
    minPurchase: 30000000,
    maxDiscount: 5000000,
    expiryDate: '2026-06-30',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
    usageLimit: 30,
    usedCount: 5
  },
  {
    id: 'v5',
    code: 'ACCESSORY',
    title: 'Giảm 100K phụ kiện',
    description: 'Dành cho phụ kiện guitar',
    discountType: 'fixed',
    discountValue: 100000,
    pointsCost: 300,
    minPurchase: 500000,
    expiryDate: '2026-07-31',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    usageLimit: 150,
    usedCount: 67
  }
];

const initialEvents: Event[] = [
  {
    id: 'e1',
    title: 'Đăng nhập liên tục 7 ngày',
    description: 'Đăng nhập mỗi ngày trong 7 ngày liên tiếp để nhận 1000 điểm thưởng',
    type: 'login_streak',
    reward: { type: 'points', value: 1000 },
    conditions: { days: 7 },
    startDate: '2026-02-01',
    endDate: '2026-12-31',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    progress: 3
  },
  {
    id: 'e2',
    title: 'Valentine Couple Deal',
    description: 'Mua guitar cùng người yêu vào ngày Valentine để được giảm 10%',
    type: 'purchase_couple',
    reward: { type: 'discount', value: 10 },
    conditions: { specificDate: '2026-02-14', requireCoupleCode: true, minPurchase: 0 },
    startDate: '2026-02-10',
    endDate: '2026-02-14',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400'
  },
  {
    id: 'e3',
    title: 'Khách hàng mới - Giảm ngay 15%',
    description: 'Đơn hàng đầu tiên được giảm 15%, tối đa 1 triệu đồng',
    type: 'first_purchase',
    reward: { type: 'discount', value: 15 },
    conditions: { minPurchase: 0 },
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400'
  },
  {
    id: 'e4',
    title: 'Tết Nguyên Đán - Lì xì 2000 điểm',
    description: 'Mua hàng trong dịp Tết để nhận 2000 điểm thưởng',
    type: 'special_day',
    reward: { type: 'points', value: 2000 },
    conditions: { specificDate: '2026-01-29', minPurchase: 1000000 },
    startDate: '2026-01-25',
    endDate: '2026-02-05',
    isActive: false,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400'
  },
  {
    id: 'e5',
    title: 'Giới thiệu bạn bè',
    description: 'Giới thiệu bạn bè mua hàng, cả hai nhận 500 điểm',
    type: 'referral',
    reward: { type: 'points', value: 500 },
    conditions: {},
    startDate: '2026-02-01',
    endDate: '2026-12-31',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400'
  },
  {
    id: 'e6',
    title: 'Black Friday Sale',
    description: 'Giảm giá cực sốc 30% cho tất cả sản phẩm',
    type: 'special_day',
    reward: { type: 'discount', value: 30 },
    conditions: { specificDate: '2026-11-27' },
    startDate: '2026-11-27',
    endDate: '2026-11-27',
    isActive: false,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400'
  }
];

const initialLandingPages: LandingPageData[] = [
  {
    id: 'lp1',
    slug: '/landing/collection-2026',
    title: 'Bộ Sưu Tập 2026',
    subtitle: 'Khám phá những cây đàn đỉnh cao',
    sections: [
      {
        type: 'hero',
        title: 'Bộ Sưu Tập Premium 2026',
        content: 'Những mẫu guitar cao cấp nhất từ các thương hiệu hàng đầu thế giới',
        images: ['https://images.unsplash.com/photo-1626406512368-ae4ad84da00f?w=1200']
      },
      {
        type: 'content',
        title: 'Crafted to Perfection',
        content: 'Mỗi cây guitar trong bộ sưu tập đều được chọn lọc kỹ càng, mang đến âm thanh và chất lượng hoàn hảo nhất cho người chơi.'
      }
    ],
    isPublished: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'lp2',
    slug: '/landing/about',
    title: 'Về Guitar NOVA',
    subtitle: 'Câu chuyện thương hiệu',
    sections: [
      {
        type: 'hero',
        title: 'Guitar NOVA',
        content: 'Hơn 10 năm đồng hành cùng âm nhạc Việt Nam',
        images: ['https://images.unsplash.com/photo-1741701862902-01b463d10435?w=1200']
      }
    ],
    isPublished: true,
    createdAt: '2025-12-01'
  },
  {
    id: 'lp3',
    slug: '/landing/vintage-collection',
    title: 'Bộ Sưu Tập Vintage',
    subtitle: 'Những viên ngọc quý từ quá khứ',
    sections: [
      {
        type: 'hero',
        title: 'Vintage Guitar Collection',
        content: 'Khám phá những cây guitar vintage hiếm có với âm thanh đặc biệt không thể nào quên',
        images: ['https://images.unsplash.com/photo-1692501735268-30251c6a30e3?w=1200']
      },
      {
        type: 'content',
        title: 'Âm Thanh Vượt Thời Gian',
        content: 'Mỗi cây guitar vintage đều mang trong mình một câu chuyện riêng, âm thanh đã được thời gian tôi luyện và trưởng thành.'
      },
      {
        type: 'gallery',
        title: 'Bộ Sưu Tập Nổi Bật',
        images: [
          'https://images.unsplash.com/photo-1692501735268-30251c6a30e3?w=600',
          'https://images.unsplash.com/photo-1763162603999-8a1958b13cf1?w=600',
          'https://images.unsplash.com/photo-1626406512368-ae4ad84da00f?w=600'
        ]
      },
      {
        type: 'cta',
        title: 'Sẵn Sàng Khám Phá?',
        content: 'Ghé thăm showroom để trải nghiệm những cây đàn vintage độc đáo',
        buttonText: 'Liên hệ ngay',
        buttonLink: '/products'
      }
    ],
    isPublished: true,
    createdAt: '2026-02-05'
  },
  {
    id: 'lp4',
    slug: '/landing/summer-sale-2026',
    title: 'Summer Sale 2026',
    subtitle: 'Giảm giá lên đến 40%',
    sections: [
      {
        type: 'hero',
        title: 'Summer Sale 2026',
        content: 'Ưu đãi cực sốc mùa hè - Giảm giá lên đến 40% cho toàn bộ sản phẩm',
        images: ['https://images.unsplash.com/photo-1695192577284-fd1b10529579?w=1200']
      },
      {
        type: 'content',
        title: 'Thời Gian Vàng',
        content: 'Đừng bỏ lỡ cơ hội sở hữu guitar mơ ước với mức giá tốt nhất trong năm. Chương trình áp dụng từ 1/6 đến 31/8/2026.'
      }
    ],
    isPublished: true,
    createdAt: '2026-02-08'
  },
  {
    id: 'lp5',
    slug: '/landing/custom-guitar-service',
    title: 'Dịch Vụ Custom Guitar',
    subtitle: 'Tạo nên cây đàn duy nhất của riêng bạn',
    sections: [
      {
        type: 'hero',
        title: 'Custom Guitar Service',
        content: 'Thiết kế và chế tác cây guitar độc nhất vô nhị theo phong cách riêng của bạn',
        images: ['https://images.unsplash.com/photo-1565829073670-cd08d8c63643?w=1200']
      },
      {
        type: 'content',
        title: 'Quy Trình Chuyên Nghiệp',
        content: 'Từ khâu thiết kế, chọn gỗ, đến hoàn thiện - mọi chi tiết đều được tùy chỉnh theo yêu cầu của bạn bởi đội ngũ luthier giàu kinh nghiệm.'
      },
      {
        type: 'cta',
        title: 'Bắt Đầu Dự Án Của Bạn',
        content: 'Liên hệ ngay để được tư vấn chi tiết',
        buttonText: 'Tư vấn miễn phí',
        buttonLink: '/products'
      }
    ],
    isPublished: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'lp6',
    slug: '/landing/draft-page',
    title: 'Trang Draft',
    subtitle: 'Đang trong quá trình xây dựng',
    sections: [
      {
        type: 'hero',
        title: 'Coming Soon',
        content: 'Nội dung đang được cập nhật',
        images: ['https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200']
      }
    ],
    isPublished: false,
    createdAt: '2026-02-10'
  }
];

const initialBlogPosts: BlogPost[] = [
  {
    id: 'bp1',
    slug: '/blog/guitar-cho-nguoi-moi-bat-dau',
    title: 'Guitar cho Người Mới Bắt Đầu',
    excerpt: 'Hướng dẫn chọn guitar phù hợp cho người mới bắt đầu chơi đàn.',
    content: 'Đây là một bài viết hướng dẫn chi tiết về cách chọn guitar phù hợp cho người mới bắt đầu chơi đàn. Chúng tôi sẽ đề cập đến các loại guitar, đặc điểm kỹ thuật và các yếu tố cần xem xét khi mua guitar đầu tiên.\n\nViệc chọn guitar đầu tiên là một quyết định quan trọng. Bạn cần xem xét nhiều yếu tố như loại nhạc bạn muốn chơi, ngân sách, và kích thước guitar phù hợp với cơ thể.\n\nGuitar acoustic thường được khuyên dùng cho người mới vì không cần thiết bị phụ trợ, trong khi guitar điện yêu cầu amplifier và các phụ kiện khác.\n\nHãy thử guitar trực tiếp trước khi mua để đảm bảo bạn cảm thấy thoải mái khi chơi.',
    coverImage: 'https://images.unsplash.com/photo-1692501735268-30251c6a30e3?w=1200',
    author: {
      name: 'Nguyễn Văn An',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    category: 'Hướng dẫn',
    tags: ['guitar', 'mới bắt đầu', 'hướng dẫn'],
    publishedDate: '2026-02-01',
    readTime: 5,
    views: 1200,
    isPublished: true
  },
  {
    id: 'bp2',
    slug: '/blog/top-5-guitar-electric-hot-nhat-2026',
    title: 'Top 5 Guitar Điện Hot Nhất 2026',
    excerpt: 'Danh sách các mẫu guitar điện được yêu thích nhất năm 2026.',
    content: 'Đây là danh sách top 5 guitar điện được yêu thích nhất năm 2026. Chúng tôi đã tổng hợp các đánh giá và nhận xét từ người dùng để đưa ra danh sách này.\n\n1. Fender Stratocaster American Professional II - Âm thanh classic Fender với công nghệ hiện đại\n2. Gibson Les Paul Standard - Biểu tượng của rock music\n3. PRS Custom 24 - Sự kết hợp hoàn hảo giữa Fender và Gibson\n4. Ibanez RG Series - Lựa chọn tốt nhất cho metal và shred\n5. Telecaster Deluxe - Vintage tone với modern playability\n\nMỗi cây đàn đều có đặc điểm riêng phù hợp với từng phong cách chơi.',
    coverImage: 'https://images.unsplash.com/photo-1626406512368-ae4ad84da00f?w=1200',
    author: {
      name: 'Trần Thị Bình',
      avatar: 'https://i.pravatar.cc/150?img=45'
    },
    category: 'Đánh giá',
    tags: ['guitar điện', 'top 5', '2026'],
    publishedDate: '2026-02-05',
    readTime: 7,
    views: 2400,
    isPublished: true
  },
  {
    id: 'bp3',
    slug: '/blog/cach-bao-quan-guitar',
    title: 'Cách Bảo Quản Guitar Đúng Cách',
    excerpt: 'Hướng dẫn bảo quản và chăm sóc guitar để giữ âm thanh tốt nhất.',
    content: 'Bảo quản guitar đúng cách là yếu tố quan trọng để duy trì chất lượng âm thanh và tuổi thọ của cây đàn.\n\nĐộ ẩm là yếu tố quan trọng nhất - guitar cần được giữ ở độ ẩm 45-55%. Quá khô hoặc quá ẩm đều có thể làm hỏng gỗ.\n\nVệ sinh thường xuyên bằng vải mềm và dầu bảo dưỡng chuyên dụng. Nới dây khi không sử dụng lâu ngày.\n\nBảo quản trong case hoặc stand, tránh ánh nắng trực tiếp và nhiệt độ cực đoan.',
    coverImage: 'https://images.unsplash.com/photo-1763162603999-8a1958b13cf1?w=1200',
    author: {
      name: 'Lê Minh Cường',
      avatar: 'https://i.pravatar.cc/150?img=33'
    },
    category: 'Hướng dẫn',
    tags: ['bảo quản', 'chăm sóc', 'guitar'],
    publishedDate: '2026-02-08',
    readTime: 6,
    views: 980,
    isPublished: true
  },
  {
    id: 'bp4',
    slug: '/blog/lich-su-guitar-fender',
    title: 'Lịch Sử Huyền Thoại Fender',
    excerpt: 'Câu chuyện về thương hiệu guitar Fender - biểu tượng của âm nhạc hiện đại.',
    content: 'Fender Musical Instruments Corporation được thành lập bởi Leo Fender vào năm 1946. Đây là một trong những thương hiệu guitar nổi tiếng nhất thế giới.\n\nNăm 1950, Fender ra mắt Telecaster - cây guitar điện solid-body đầu tiên được sản xuất hàng loạt. Đây là một cuộc cách mạng trong ngành công nghiệp nhạc cụ.\n\nNăm 1954, Stratocaster ra đời với thiết kế mang tính biểu tượng - ba pickup, tremolo bridge, và body cong mượt mà.\n\nFender đã định hình âm thanh của rock, blues, jazz và nhiều thể loại nhạc khác trong hơn 70 năm qua.',
    coverImage: 'https://images.unsplash.com/photo-1695192577284-fd1b10529579?w=1200',
    author: {
      name: 'Nguyễn Văn An',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    category: 'Lịch sử',
    tags: ['Fender', 'lịch sử', 'guitar điện'],
    publishedDate: '2026-02-03',
    readTime: 8,
    views: 1560,
    isPublished: true
  },
  {
    id: 'bp5',
    slug: '/blog/kien-thuc-co-ban-ve-am-thanh-guitar',
    title: 'Kiến Thức Cơ Bản Về Âm Thanh Guitar',
    excerpt: 'Tìm hiểu về các yếu tố ảnh hưởng đến âm thanh của guitar.',
    content: 'Âm thanh guitar phụ thuộc vào nhiều yếu tố khác nhau, từ loại gỗ đến pickup và amplifier.\n\nGỗ body ảnh hưởng lớn đến tone: Alder cho âm balanced, Mahogany cho âm ấm và thick, Ash cho âm bright và punchy.\n\nPickup là "tai" của guitar điện - Single-coil cho âm sáng và rõ ràng, Humbucker cho âm dày và ít noise.\n\nScale length cũng quan trọng - scale dài cho tension cao và clarity tốt hơn, scale ngắn dễ chơi và âm ấm hơn.\n\nHiểu rõ các yếu tố này giúp bạn chọn được guitar phù hợp với phong cách âm nhạc của mình.',
    coverImage: 'https://images.unsplash.com/photo-1565829073670-cd08d8c63643?w=1200',
    author: {
      name: 'Trần Thị Bình',
      avatar: 'https://i.pravatar.cc/150?img=45'
    },
    category: 'Kiến thức',
    tags: ['âm thanh', 'tone', 'kiến thức'],
    publishedDate: '2026-02-09',
    readTime: 9,
    views: 1890,
    isPublished: true
  }
];

const initialUsers: UserData[] = [
  {
    id: 'u1',
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    points: 2500,
    joinDate: '2025-06-15',
    totalOrders: 8,
    totalSpent: 45000000,
    lastLogin: '2026-02-07',
    status: 'active',
    tier: 'gold'
  },
  {
    id: 'u2',
    name: 'Trần Thị Bình',
    email: 'tranthib@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=45',
    points: 1200,
    joinDate: '2025-08-20',
    totalOrders: 4,
    totalSpent: 18000000,
    lastLogin: '2026-02-06',
    status: 'active',
    tier: 'silver'
  },
  {
    id: 'u3',
    name: 'Lê Minh Cường',
    email: 'leminhcuong@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=33',
    points: 850,
    joinDate: '2025-10-10',
    totalOrders: 2,
    totalSpent: 9500000,
    lastLogin: '2026-02-05',
    status: 'active',
    tier: 'bronze'
  },
  {
    id: 'u4',
    name: 'Phạm Thu Hà',
    email: 'phamthuha@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=23',
    points: 5800,
    joinDate: '2024-12-01',
    totalOrders: 15,
    totalSpent: 89000000,
    lastLogin: '2026-02-07',
    status: 'active',
    tier: 'platinum'
  },
  {
    id: 'u5',
    name: 'Hoàng Đức Em',
    email: 'hoangducem@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=51',
    points: 300,
    joinDate: '2026-01-20',
    totalOrders: 1,
    totalSpent: 2800000,
    lastLogin: '2026-01-25',
    status: 'inactive',
    tier: 'bronze'
  }
];

const initialReviews: Review[] = [
  {
    id: 'r1',
    userId: 'u1',
    user: 'Nguyễn Văn An',
    avatar: 'https://i.pravatar.cc/150?img=12',
    productId: '1',
    productName: 'Fender Stratocaster American Professional II',
    rating: 5,
    comment: 'Âm thanh tuyệt vời, đáng giá từng đồng! Giao hàng nhanh, đóng gói cẩn thận.',
    date: '2026-01-15',
    images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400']
  },
  {
    id: 'r2',
    userId: 'u2',
    user: 'Trần Thị Bình',
    avatar: 'https://i.pravatar.cc/150?img=45',
    productId: '1',
    productName: 'Fender Stratocaster American Professional II',
    rating: 5,
    comment: 'Chất lượng premium, giao hàng nhanh. Rất hài lòng với dịch vụ của Guitar NOVA.',
    date: '2026-01-20',
    images: []
  },
  {
    id: 'r3',
    userId: 'u4',
    user: 'Phạm Thu Hà',
    avatar: 'https://i.pravatar.cc/150?img=23',
    productId: '2',
    productName: 'Gibson Les Paul Standard 60s',
    rating: 5,
    comment: 'Gibson Les Paul là mơ ước của tôi! Cảm ơn Guitar NOVA đã mang đến trải nghiệm tuyệt vời.',
    date: '2026-01-25',
    images: ['https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400']
  },
  {
    id: 'r4',
    userId: 'u3',
    user: 'Lê Minh Cường',
    avatar: 'https://i.pravatar.cc/150?img=33',
    productId: '3',
    productName: 'Yamaha FG800 Acoustic',
    rating: 4,
    comment: 'Guitar tốt cho người mới bắt đầu như tôi. Âm thanh khá ổn với mức giá này.',
    date: '2026-02-01',
    images: []
  },
  {
    id: 'r5',
    userId: 'u1',
    user: 'Nguyễn Văn An',
    avatar: 'https://i.pravatar.cc/150?img=12',
    productId: '5',
    productName: 'Marshall DSL40CR Amplifier',
    rating: 5,
    comment: 'Marshall tone chuẩn chỉnh! Ampli này quá đỉnh cho rock và metal.',
    date: '2026-02-03',
    images: []
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [currentPage, setCurrentPage] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [userVouchers, setUserVouchers] = useState<string[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPageData[]>(initialLandingPages);
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [allReviews, setAllReviews] = useState<Review[]>(initialReviews);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);

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