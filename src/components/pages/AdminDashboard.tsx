import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, BarChart3, Package, Users, FileText, Image,
  Star, Plus, Edit, Trash2, X, DollarSign, TrendingUp, ShoppingCart,
  Gift, Calendar, Award, Settings as SettingsIcon, Truck, Warehouse, AlertTriangle,
  Upload, CreditCard
} from 'lucide-react';
import { useApp, Product, Banner, Voucher, Event, UserData, Review, LandingPageData, BlogPost } from '@/app/context/AppContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { brandsApi, shippingApi, inventoryApi, settingsApi, analyticsApi, uploadApi } from '@/app/lib/api';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { 
    products, setProducts, 
    banners, setBanners,
    vouchers, setVouchers,
    events, setEvents,
    users, setUsers,
    allReviews, setAllReviews,
    landingPages, setLandingPages,
    blogPosts, setBlogPosts
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingLandingPage, setEditingLandingPage] = useState<LandingPageData | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [dashboardPeriod, setDashboardPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // ── Real API state ──────────────────────────────────────
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [realBrands, setRealBrands] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [inventoryStats, setInventoryStats] = useState<any>(null);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  // ── Brand modal ─────────────────────────────────────────
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [brandForm, setBrandForm] = useState({ name: '', slug: '', logo: '', description: '', website: '', hotline: '' });

  // ── Shipping modal ──────────────────────────────────────
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [editingShipping, setEditingShipping] = useState<any>(null);
  const [shippingForm, setShippingForm] = useState({ name: '', description: '', baseCost: '', costPerKm: '', freeThreshold: '', estimatedDays: '', order: '0' });

  // ── Inventory adjust modal ──────────────────────────────
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Mock analytics data theo tiếng Việt
  const getRevenueData = () => {
    if (dashboardPeriod === 'day') {
      return [
        { name: '00:00', doanhthu: 2500000 },
        { name: '04:00', doanhthu: 1800000 },
        { name: '08:00', doanhthu: 4200000 },
        { name: '12:00', doanhthu: 6800000 },
        { name: '16:00', doanhthu: 5500000 },
        { name: '20:00', doanhthu: 7200000 }
      ];
    } else if (dashboardPeriod === 'week') {
      return [
        { name: 'T2', doanhthu: 12000000 },
        { name: 'T3', doanhthu: 15000000 },
        { name: 'T4', doanhthu: 13500000 },
        { name: 'T5', doanhthu: 18000000 },
        { name: 'T6', doanhthu: 22000000 },
        { name: 'T7', doanhthu: 25000000 },
        { name: 'CN', doanhthu: 20000000 }
      ];
    } else if (dashboardPeriod === 'month') {
      return [
        { name: 'T1', doanhthu: 45000000 },
        { name: 'T2', doanhthu: 52000000 },
        { name: 'T3', doanhthu: 48000000 },
        { name: 'T4', doanhthu: 61000000 },
        { name: 'T5', doanhthu: 55000000 },
        { name: 'T6', doanhthu: 67000000 }
      ];
    } else {
      return [
        { name: 'Q1', doanhthu: 145000000 },
        { name: 'Q2', doanhthu: 178000000 },
        { name: 'Q3', doanhthu: 162000000 },
        { name: 'Q4', doanhthu: 195000000 }
      ];
    }
  };

  const categoryData = [
    { name: 'Guitar Điện', value: 45, fill: '#f59e0b' },
    { name: 'Guitar Acoustic', value: 30, fill: '#3b82f6' },
    { name: 'Bass Guitar', value: 15, fill: '#8b5cf6' },
    { name: 'Amplifier', value: 10, fill: '#10b981' }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'brands', label: 'Thương hiệu', icon: Award },
    { id: 'inventory', label: 'Kho hàng', icon: Warehouse },
    { id: 'banners', label: 'Banner', icon: Image },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'reviews', label: 'Đánh giá', icon: Star },
    { id: 'vouchers', label: 'Voucher', icon: Gift },
    { id: 'events', label: 'Sự kiện', icon: Calendar },
    { id: 'shipping', label: 'Vận chuyển', icon: Truck },
    { id: 'settings', label: 'Cài đặt', icon: SettingsIcon },
    { id: 'landing', label: 'Landing Pages', icon: FileText },
    { id: 'blog', label: 'Blog Posts', icon: FileText }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // ── Data loaders ──────────────────────────────────────────
  const loadBrands = async () => {
    try {
      const data = await brandsApi.getAll();
      setRealBrands(data.brands || []);
    } catch { toast.error('Không thể tải danh sách thương hiệu'); }
  };

  const loadShipping = async () => {
    try {
      const data = await shippingApi.getAdminAll();
      setShippingMethods(data.shippingMethods || []);
    } catch { toast.error('Không thể tải phương thức vận chuyển'); }
  };

  const loadInventory = async () => {
    try {
      const [overview, lowStock] = await Promise.all([
        inventoryApi.getOverview(),
        inventoryApi.getLowStock(),
      ]);
      setInventoryStats(overview);
      setLowStockProducts(lowStock.products || []);
    } catch { toast.error('Không thể tải dữ liệu kho hàng'); }
  };

  const loadSettings = async () => {
    try {
      const data = await settingsApi.get();
      setSiteSettings(data);
    } catch { toast.error('Không thể tải cài đặt'); }
  };

  // Map API revenue data → chart format
  const mapRevenueData = (data: any[]) =>
    data.map(d => ({ name: d.date, doanhthu: d.revenue }));

  // ── useEffects ────────────────────────────────────────────
  useEffect(() => {
    analyticsApi.getOverview()
      .then(d => setAnalyticsOverview(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    analyticsApi.getRevenue(dashboardPeriod)
      .then(d => { if (d?.data) setRevenueChartData(mapRevenueData(d.data)); })
      .catch(() => {});
  }, [dashboardPeriod]);

  useEffect(() => {
    if (activeTab === 'brands') loadBrands();
    if (activeTab === 'shipping') loadShipping();
    if (activeTab === 'inventory') loadInventory();
    if (activeTab === 'settings') loadSettings();
  }, [activeTab]);

  // ── Brand CRUD ────────────────────────────────────────────
  const openBrandModal = (brand?: any) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandForm({ name: brand.name, slug: brand.slug, logo: brand.logo || '', description: brand.description || '', website: brand.website || '', hotline: brand.hotline || '' });
    } else {
      setEditingBrand(null);
      setBrandForm({ name: '', slug: '', logo: '', description: '', website: '', hotline: '' });
    }
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = async () => {
    try {
      if (editingBrand) {
        await brandsApi.update(editingBrand.id, brandForm);
        toast.success('Đã cập nhật thương hiệu');
      } else {
        await brandsApi.create(brandForm);
        toast.success('Đã thêm thương hiệu');
      }
      setIsBrandModalOpen(false);
      loadBrands();
    } catch (e: any) { toast.error(e.message || 'Lỗi khi lưu thương hiệu'); }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await brandsApi.delete(id);
      toast.success('Đã xóa thương hiệu');
      loadBrands();
    } catch (e: any) { toast.error(e.message || 'Không thể xóa thương hiệu đang có sản phẩm'); }
  };

  // Auto-generate slug from name
  const handleBrandNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setBrandForm(f => ({ ...f, name, slug: f.slug === '' || f.slug === (f.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) ? slug : f.slug }));
  };

  // ── Shipping CRUD ─────────────────────────────────────────
  const openShippingModal = (method?: any) => {
    if (method) {
      setEditingShipping(method);
      setShippingForm({ name: method.name, description: method.description || '', baseCost: String(method.baseCost), costPerKm: String(method.costPerKm), freeThreshold: String(method.freeThreshold), estimatedDays: method.estimatedDays, order: String(method.order ?? 0) });
    } else {
      setEditingShipping(null);
      setShippingForm({ name: '', description: '', baseCost: '', costPerKm: '', freeThreshold: '', estimatedDays: '', order: '0' });
    }
    setIsShippingModalOpen(true);
  };

  const handleSaveShipping = async () => {
    try {
      const payload = { ...shippingForm, baseCost: parseFloat(shippingForm.baseCost), costPerKm: parseFloat(shippingForm.costPerKm), freeThreshold: parseFloat(shippingForm.freeThreshold), order: parseInt(shippingForm.order) };
      if (editingShipping) {
        await shippingApi.update(editingShipping.id, payload);
        toast.success('Đã cập nhật phương thức vận chuyển');
      } else {
        await shippingApi.create(payload);
        toast.success('Đã thêm phương thức vận chuyển');
      }
      setIsShippingModalOpen(false);
      loadShipping();
    } catch (e: any) { toast.error(e.message || 'Lỗi khi lưu phương thức vận chuyển'); }
  };

  const handleDeleteShipping = async (id: string) => {
    try {
      await shippingApi.delete(id);
      toast.success('Đã xóa phương thức vận chuyển');
      loadShipping();
    } catch (e: any) { toast.error(e.message || 'Không thể xóa'); }
  };

  const handleToggleShipping = async (id: string) => {
    try {
      await shippingApi.toggle(id);
      loadShipping();
    } catch { toast.error('Không thể thay đổi trạng thái'); }
  };

  // ── Inventory adjust ──────────────────────────────────────
  const handleAdjustStock = async () => {
    if (!adjustingProduct || !adjustQty) return;
    try {
      await inventoryApi.adjust(adjustingProduct.id, parseInt(adjustQty), 'IN', adjustNotes);
      toast.success('Đã cập nhật tồn kho');
      setIsAdjustModalOpen(false);
      setAdjustQty('');
      setAdjustNotes('');
      loadInventory();
    } catch (e: any) { toast.error(e.message || 'Lỗi khi điều chỉnh kho'); }
  };

  // ── Settings save ─────────────────────────────────────────
  const handleSaveSettings = async () => {
    try {
      await settingsApi.update(siteSettings);
      toast.success('Đã lưu cài đặt');
    } catch (e: any) { toast.error(e.message || 'Lỗi khi lưu cài đặt'); }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success('Đã xóa sản phẩm');
  };

  const handleDeleteBanner = (id: string) => {
    setBanners(banners.filter(b => b.id !== id));
    toast.success('Đã xóa banner');
  };

  const handleDeleteVoucher = (id: string) => {
    setVouchers(vouchers.filter(v => v.id !== id));
    toast.success('Đã xóa voucher');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    toast.success('Đã xóa sự kiện');
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.success('Đã xóa người dùng');
  };

  const handleDeleteReview = (id: string) => {
    setAllReviews(allReviews.filter(r => r.id !== id));
    toast.success('Đã xóa đánh giá');
  };

  const handleDeleteLandingPage = (id: string) => {
    setLandingPages(landingPages.filter(l => l.id !== id));
    toast.success('Đã xóa landing page');
  };

  const handleSave = () => {
    toast.success('Đã lưu thành công');
    setIsModalOpen(false);
    setEditingProduct(null);
    setEditingBanner(null);
    setEditingVoucher(null);
    setEditingEvent(null);
    setEditingLandingPage(null);
    setEditingBlogPost(null);
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border-b border-purple-500/20 mb-8">
        <div className="container mx-auto px-4 py-6">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại trang chủ</span>
          </motion.button>

          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-purple-300">Quản lý toàn bộ hệ thống Guitar NOVA</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-4 border border-white/10 sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 5 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Period Selector */}
                  <div className="flex gap-2 mb-6">
                    {['day', 'week', 'month', 'year'].map((period) => (
                      <motion.button
                        key={period}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDashboardPeriod(period as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          dashboardPeriod === period
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {period === 'day' && 'Ngày'}
                        {period === 'week' && 'Tuần'}
                        {period === 'month' && 'Tháng'}
                        {period === 'year' && 'Năm'}
                      </motion.button>
                    ))}
                  </div>

                  {/* Stats Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-2xl p-6 border border-blue-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-10 h-10 text-blue-400" />
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      <p className="text-blue-200 text-sm mb-1">Tổng doanh thu</p>
                      <p className="text-2xl font-bold text-white">
                        {analyticsOverview ? formatPrice(analyticsOverview.totalRevenue) : '—'}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-2xl p-6 border border-green-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <ShoppingCart className="w-10 h-10 text-green-400" />
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      <p className="text-green-200 text-sm mb-1">Tổng đơn hàng</p>
                      <p className="text-2xl font-bold text-white">
                        {analyticsOverview ? analyticsOverview.totalOrders : '—'}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-6 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <Package className="w-10 h-10 text-purple-400" />
                        <span className="text-purple-400 text-sm font-medium">{analyticsOverview?.totalProducts ?? products.length}</span>
                      </div>
                      <p className="text-purple-200 text-sm mb-1">Sản phẩm</p>
                      <p className="text-2xl font-bold text-white">
                        {analyticsOverview?.totalProducts ?? products.length}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-2xl p-6 border border-orange-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="w-10 h-10 text-orange-400" />
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                      </div>
                      <p className="text-orange-200 text-sm mb-1">Khách hàng</p>
                      <p className="text-2xl font-bold text-white">
                        {analyticsOverview?.totalCustomers ?? users.length}
                      </p>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-6">
                        Biểu đồ doanh thu ({dashboardPeriod === 'day' ? 'Ngày' : dashboardPeriod === 'week' ? 'Tuần' : dashboardPeriod === 'month' ? 'Tháng' : 'Năm'})
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueChartData.length > 0 ? revenueChartData : getRevenueData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#999" />
                          <YAxis stroke="#999" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333' }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value: number) => formatPrice(value)}
                          />
                          <Line type="monotone" dataKey="doanhthu" stroke="#f59e0b" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-6">Phân loại sản phẩm</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Đơn hàng gần đây</h3>
                    {analyticsOverview?.recentOrders?.length > 0 ? (
                      <div className="space-y-3">
                        {analyticsOverview.recentOrders.map((order: any) => (
                          <div key={order.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white/80 truncate">
                                {order.user?.name || 'Khách hàng'} — {formatPrice(parseFloat(order.totalAmount))}
                              </p>
                              <p className="text-white/40 text-xs">{order.status}</p>
                            </div>
                            <span className="text-white/40 text-sm flex-shrink-0">{formatDate(order.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/40 text-sm">Chưa có đơn hàng</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý sản phẩm</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingProduct(null);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm sản phẩm
                    </motion.button>
                  </div>

                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Sản phẩm</th>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Danh mục</th>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Giá</th>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Đánh giá</th>
                            <th className="px-6 py-4 text-right text-white/80 font-medium">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                  <div>
                                    <p className="text-white font-medium line-clamp-1">{product.name}</p>
                                    <p className="text-white/40 text-sm">ID: {product.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-white/60">{product.category}</td>
                              <td className="px-6 py-4">
                                <p className="text-amber-500 font-medium">{formatPrice(product.price)}</p>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                  <span className="text-white">{product.rating}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setIsModalOpen(true);
                                    }}
                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'brands' && (
                <motion.div
                  key="brands"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý Thương Hiệu</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openBrandModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm thương hiệu
                    </motion.button>
                  </div>

                  {realBrands.length === 0 ? (
                    <div className="text-center py-16 text-white/40">
                      <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Chưa có thương hiệu nào. Nhấn "Thêm thương hiệu" để bắt đầu.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {realBrands.map((brand) => (
                        <div key={brand.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10 hover:border-amber-500/30 transition-all">
                          <div className="flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                {brand.logo ? (
                                  <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain bg-white rounded-lg p-1" />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <Award className="w-6 h-6 text-white" />
                                  </div>
                                )}
                                <div>
                                  <h3 className="text-lg font-bold text-white">{brand.name}</h3>
                                  <p className="text-white/40 text-xs">@{brand.slug}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                brand.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'
                              }`}>
                                {brand.isActive ? 'Hoạt động' : 'Tạm dừng'}
                              </span>
                            </div>

                            <p className="text-white/60 text-sm mb-4 flex-grow">{brand.description || '—'}</p>

                            <div className="space-y-2 mb-4">
                              {brand.website && (
                                <div className="flex items-center gap-2 text-white/40 text-xs">
                                  <FileText className="w-3 h-3" />
                                  <a href={brand.website} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors truncate">{brand.website}</a>
                                </div>
                              )}
                              {brand.hotline && (
                                <div className="flex items-center gap-2 text-white/40 text-xs">
                                  <ShoppingCart className="w-3 h-3" />
                                  <span>{brand.hotline}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-amber-400" />
                                <span className="text-white font-semibold">{brand._count?.products ?? 0} sản phẩm</span>
                              </div>
                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openBrandModal(brand)}
                                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteBrand(brand.id)}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'inventory' && (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý Kho Hàng</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={loadInventory}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
                    >
                      <TrendingUp className="w-5 h-5" />
                      Làm mới
                    </motion.button>
                  </div>

                  {/* Inventory Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                          <Package className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Tổng sản phẩm</p>
                          <p className="text-2xl font-bold text-white">{inventoryStats?.totalProducts ?? '—'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl p-4 border border-yellow-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                          <AlertTriangle className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Sắp hết hàng</p>
                          <p className="text-2xl font-bold text-white">{inventoryStats?.lowStockCount ?? '—'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-4 border border-red-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500/20 rounded-lg">
                          <X className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Hết hàng</p>
                          <p className="text-2xl font-bold text-white">{inventoryStats?.outOfStockCount ?? '—'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                          <Warehouse className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Tổng số lượng</p>
                          <p className="text-2xl font-bold text-white">{inventoryStats?.totalStock?.toLocaleString('vi-VN') ?? '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Alert Section */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      Cảnh báo sắp hết hàng
                    </h3>

                    {lowStockProducts.length === 0 ? (
                      <div className="text-center py-10 text-white/40">
                        <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>Không có sản phẩm sắp hết hàng</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {lowStockProducts.map((product) => (
                          <div key={product.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-4 border border-yellow-500/20">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                  <div>
                                    <h4 className="text-white font-semibold">{product.name}</h4>
                                    <p className="text-white/40 text-sm">{product.category?.name}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-white/40 text-xs">Tồn kho</p>
                                  <p className="text-2xl font-bold text-yellow-400">{product.stock}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-white/40 text-xs">Mức cảnh báo</p>
                                  <p className="text-white font-semibold">{product.lowStockAlert}</p>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => { setAdjustingProduct(product); setIsAdjustModalOpen(true); }}
                                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm font-semibold"
                                >
                                  Nhập thêm
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'banners' && (
                <motion.div
                  key="banners"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý Banner</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingBanner(null);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm banner
                    </motion.button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {banners.map((banner) => (
                      <div key={banner.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-white/10">
                        <div className="relative h-48">
                          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold mb-1">{banner.title}</h3>
                            <p className="text-white/60 text-sm">{banner.subtitle}</p>
                          </div>
                        </div>
                        <div className="p-4 flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setEditingBanner(banner);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Quản lý người dùng</h2>
                  
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Người dùng</th>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Email</th>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Hạng</th>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Điểm</th>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Tổng chi</th>
                            <th className="px-6 py-4 text-right text-white/80 font-medium">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full"
                                  />
                                  <div>
                                    <p className="text-white font-medium">{user.name}</p>
                                    <p className="text-white/40 text-sm">{user.totalOrders} đơn hàng</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-white/60">{user.email}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  user.tier === 'platinum' ? 'bg-purple-500/20 text-purple-400' :
                                  user.tier === 'gold' ? 'bg-amber-500/20 text-amber-400' :
                                  user.tier === 'silver' ? 'bg-zinc-500/20 text-zinc-400' :
                                  'bg-orange-500/20 text-orange-400'
                                }`}>
                                  {user.tier.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-white">{user.points.toLocaleString('vi-VN')}</td>
                              <td className="px-6 py-4 text-amber-500 font-medium">
                                {formatPrice(user.totalSpent)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toast.success('Chức năng đang phát triển')}
                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Quản lý đánh giá</h2>
                  
                  <div className="space-y-4">
                    {allReviews.map((review) => (
                      <div key={review.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={review.avatar}
                              alt={review.user}
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <p className="text-white font-medium">{review.user}</p>
                              <p className="text-white/40 text-sm">{review.productName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-amber-500 text-amber-500'
                                      : 'text-white/20'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-white/60 text-sm">{formatDate(review.date)}</span>
                          </div>
                        </div>
                        <p className="text-white/80 mb-4">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {review.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt=""
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteReview(review.id)}
                            className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                          >
                            Xóa đánh giá
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'vouchers' && (
                <motion.div
                  key="vouchers"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý Voucher</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingVoucher(null);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm voucher
                    </motion.button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vouchers.map((voucher) => (
                      <div key={voucher.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-amber-500/20">
                        <div className="relative h-32">
                          <img src={voucher.image} alt={voucher.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                            voucher.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {voucher.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg mb-3">
                            <span className="text-amber-400 font-mono font-bold text-sm">{voucher.code}</span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2">{voucher.title}</h3>
                          <div className="flex items-center gap-2 text-amber-400 mb-3">
                            <Star className="w-5 h-5 fill-amber-400" />
                            <span className="font-bold">{voucher.pointsCost.toLocaleString('vi-VN')} điểm</span>
                          </div>
                          <p className="text-xs text-white/50 mb-4">
                            Đã dùng: {voucher.usedCount}/{voucher.usageLimit}
                          </p>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setEditingVoucher(voucher);
                                setIsModalOpen(true);
                              }}
                              className="flex-1 py-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-sm"
                            >
                              Chỉnh sửa
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteVoucher(voucher.id)}
                              className="flex-1 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                            >
                              Xóa
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'events' && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý Sự kiện</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingEvent(null);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm sự kiện
                    </motion.button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {events.map((event) => (
                      <div key={event.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-white/10">
                        <div className="relative h-48">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                            event.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {event.isActive ? 'Đang diễn ra' : 'Tạm dừng'}
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                          <p className="text-white/60 text-sm mb-3 line-clamp-2">{event.description}</p>
                          <div className="flex items-center gap-2 text-amber-400 mb-3">
                            <Award className="w-5 h-5" />
                            <span className="text-sm">
                              {event.reward.type === 'points' && `+${event.reward.value} điểm`}
                              {event.reward.type === 'discount' && `Giảm ${event.reward.value}%`}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 mb-4">
                            {formatDate(event.startDate)} - {formatDate(event.endDate)}
                          </p>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setEditingEvent(event);
                                setIsModalOpen(true);
                              }}
                              className="flex-1 py-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-sm"
                            >
                              Chỉnh sửa
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteEvent(event.id)}
                              className="flex-1 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                            >
                              Xóa
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'landing' && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý Landing Pages</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingLandingPage(null);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm landing page
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {landingPages.map((page) => (
                      <div key={page.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">{page.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                page.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'
                              }`}>
                                {page.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                              </span>
                            </div>
                            <p className="text-white/60 mb-2">{page.subtitle}</p>
                            <p className="text-white/40 text-sm">Slug: {page.slug}</p>
                            <p className="text-white/40 text-sm">Ngày tạo: {formatDate(page.createdAt)}</p>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setEditingLandingPage(page);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteLandingPage(page.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý Vận Chuyển</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openShippingModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm phương thức
                    </motion.button>
                  </div>

                  {shippingMethods.length === 0 ? (
                    <div className="text-center py-16 text-white/40">
                      <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Chưa có phương thức vận chuyển nào.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {shippingMethods.map((method) => (
                        <div key={method.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Truck className="w-6 h-6 text-orange-400" />
                                <h3 className="text-xl font-bold text-white">{method.name}</h3>
                                <button
                                  onClick={() => handleToggleShipping(method.id)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                    method.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30'
                                  }`}
                                >
                                  {method.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                </button>
                              </div>
                              <p className="text-white/60 mb-4">{method.description}</p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="bg-white/5 rounded-lg p-3">
                                  <p className="text-white/40 text-xs mb-1">Phí cơ bản</p>
                                  <p className="text-white font-semibold">{formatPrice(parseFloat(method.baseCost))}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                  <p className="text-white/40 text-xs mb-1">Phí / km</p>
                                  <p className="text-white font-semibold">{formatPrice(parseFloat(method.costPerKm))}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                  <p className="text-white/40 text-xs mb-1">Freeship từ</p>
                                  <p className="text-white font-semibold">{formatPrice(parseFloat(method.freeThreshold))}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                  <p className="text-white/40 text-xs mb-1">Thời gian</p>
                                  <p className="text-white font-semibold">{method.estimatedDays}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openShippingModal(method)}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteShipping(method.id)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Cài Đặt Website</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveSettings}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all"
                    >
                      Lưu cài đặt
                    </motion.button>
                  </div>

                  {!siteSettings ? (
                    <div className="text-center py-16 text-white/40">Đang tải cài đặt...</div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Site Information */}
                      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-400" />
                          Thông tin website
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-white/60 text-sm mb-2">Tên website</label>
                            <input
                              type="text"
                              value={siteSettings.siteName || ''}
                              onChange={e => setSiteSettings((s: any) => ({ ...s, siteName: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-white/60 text-sm mb-2">Slogan</label>
                            <input
                              type="text"
                              value={siteSettings.slogan || ''}
                              onChange={e => setSiteSettings((s: any) => ({ ...s, slogan: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          {/* Logo upload */}
                          <div>
                            <label className="block text-white/60 text-sm mb-2">Logo cửa hàng</label>
                            <div className="flex items-start gap-4">
                              {siteSettings.logo && (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                                  <img src={siteSettings.logo} alt="Logo" className="w-full h-full object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => setSiteSettings((s: any) => ({ ...s, logo: '' }))}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                                  >
                                    <X className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              )}
                              <label className="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                                <Upload className="w-6 h-6 text-white/40" />
                                <span className="text-white/40 text-sm">{siteSettings.logo ? 'Thay đổi logo' : 'Tải lên logo'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      toast.loading('Đang tải lên logo...', { id: 'upload-logo' });
                                      const url = await uploadApi.uploadToCloudinary(file, 'guitar-nova/settings');
                                      setSiteSettings((s: any) => ({ ...s, logo: url }));
                                      toast.success('Tải lên logo thành công', { id: 'upload-logo' });
                                    } catch {
                                      toast.error('Lỗi tải lên logo', { id: 'upload-logo' });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          {/* Favicon upload */}
                          <div>
                            <label className="block text-white/60 text-sm mb-2">Favicon</label>
                            <div className="flex items-start gap-4">
                              {siteSettings.favicon && (
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                                  <img src={siteSettings.favicon} alt="Favicon" className="w-full h-full object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => setSiteSettings((s: any) => ({ ...s, favicon: '' }))}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                                  >
                                    <X className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              )}
                              <label className="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                                <Upload className="w-5 h-5 text-white/40" />
                                <span className="text-white/40 text-xs">{siteSettings.favicon ? 'Thay đổi favicon' : 'Tải lên favicon'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      toast.loading('Đang tải lên favicon...', { id: 'upload-favicon' });
                                      const url = await uploadApi.uploadToCloudinary(file, 'guitar-nova/settings');
                                      setSiteSettings((s: any) => ({ ...s, favicon: url }));
                                      toast.success('Tải lên favicon thành công', { id: 'upload-favicon' });
                                    } catch {
                                      toast.error('Lỗi tải lên favicon', { id: 'upload-favicon' });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Settings (Tiêu đề thẻ - Logo thẻ) */}
                      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-amber-400" />
                          Cài đặt thẻ
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-white/60 text-sm mb-2">Tiêu đề thẻ</label>
                            <input
                              type="text"
                              value={siteSettings.cardTitle || ''}
                              onChange={e => setSiteSettings((s: any) => ({ ...s, cardTitle: e.target.value }))}
                              placeholder="VD: Guitar NOVA Member Card"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                          {/* Card Logo upload */}
                          <div>
                            <label className="block text-white/60 text-sm mb-2">Logo thẻ</label>
                            <div className="flex items-start gap-4">
                              {siteSettings.cardLogo && (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                                  <img src={siteSettings.cardLogo} alt="Card Logo" className="w-full h-full object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => setSiteSettings((s: any) => ({ ...s, cardLogo: '' }))}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                                  >
                                    <X className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              )}
                              <label className="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-amber-500/50 transition-colors">
                                <Upload className="w-6 h-6 text-white/40" />
                                <span className="text-white/40 text-sm">{siteSettings.cardLogo ? 'Thay đổi logo thẻ' : 'Tải lên logo thẻ'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      toast.loading('Đang tải lên logo thẻ...', { id: 'upload-card-logo' });
                                      const url = await uploadApi.uploadToCloudinary(file, 'guitar-nova/settings');
                                      setSiteSettings((s: any) => ({ ...s, cardLogo: url }));
                                      toast.success('Tải lên logo thẻ thành công', { id: 'upload-card-logo' });
                                    } catch {
                                      toast.error('Lỗi tải lên logo thẻ', { id: 'upload-card-logo' });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          {/* Card Preview */}
                          {(siteSettings.cardTitle || siteSettings.cardLogo) && (
                            <div>
                              <label className="block text-white/60 text-sm mb-2">Xem trước thẻ</label>
                              <div className="relative w-full aspect-[1.6/1] max-w-xs rounded-xl overflow-hidden bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-400 p-4 flex flex-col justify-between shadow-lg">
                                {siteSettings.cardLogo && (
                                  <img src={siteSettings.cardLogo} alt="Card Logo" className="w-12 h-12 object-contain" />
                                )}
                                <div>
                                  <p className="text-white font-bold text-sm">{siteSettings.cardTitle || 'Tiêu đề thẻ'}</p>
                                  <p className="text-white/70 text-xs mt-1">{siteSettings.siteName || 'Guitar NOVA'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-400" />
                          Thông tin liên hệ
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-white/60 text-sm mb-2">Email</label>
                            <input
                              type="email"
                              value={siteSettings.email || ''}
                              onChange={e => setSiteSettings((s: any) => ({ ...s, email: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-white/60 text-sm mb-2">Số điện thoại</label>
                            <input
                              type="text"
                              value={siteSettings.phone || ''}
                              onChange={e => setSiteSettings((s: any) => ({ ...s, phone: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-white/60 text-sm mb-2">Địa chỉ</label>
                            <textarea
                              value={siteSettings.address || ''}
                              onChange={e => setSiteSettings((s: any) => ({ ...s, address: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Social Media */}
                      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Image className="w-5 h-5 text-pink-400" />
                          Mạng xã hội
                        </h3>
                        <div className="space-y-4">
                          {[
                            { key: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                            { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                            { key: 'youtubeUrl', label: 'YouTube', placeholder: 'https://youtube.com/...' },
                            { key: 'tiktokUrl', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
                          ].map(({ key, label, placeholder }) => (
                            <div key={key}>
                              <label className="block text-white/60 text-sm mb-2">{label}</label>
                              <input
                                type="url"
                                value={siteSettings[key] || ''}
                                onChange={e => setSiteSettings((s: any) => ({ ...s, [key]: e.target.value }))}
                                placeholder={placeholder}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-pink-500 focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SEO Settings */}
                      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10 lg:col-span-2">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          SEO Settings
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-white/60 text-sm mb-2">Meta Title</label>
                            <input
                              type="text"
                              value={siteSettings.metaTitle || ''}
                              onChange={e => setSiteSettings((s: any) => ({ ...s, metaTitle: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-white/60 text-sm mb-2">Meta Keywords</label>
                            <input
                              type="text"
                              value={siteSettings.metaKeywords || ''}
                              onChange={e => setSiteSettings((s: any) => ({ ...s, metaKeywords: e.target.value }))}
                              placeholder="guitar, music, instruments..."
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <label className="block text-white/60 text-sm mb-2">Meta Description</label>
                            <textarea
                              value={siteSettings.metaDescription || ''}
                              onChange={e => setSiteSettings((s: any) => ({ ...s, metaDescription: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none resize-none"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Brand Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isBrandModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsBrandModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 max-w-lg w-full border border-white/10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}</h2>
                <button onClick={() => setIsBrandModalOpen(false)} className="p-2 text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'name', label: 'Tên thương hiệu *', type: 'text', onChange: (v: string) => handleBrandNameChange(v) },
                  { key: 'slug', label: 'Slug *', type: 'text' },
                  { key: 'logo', label: 'Logo URL', type: 'url' },
                  { key: 'website', label: 'Website', type: 'url' },
                  { key: 'hotline', label: 'Hotline', type: 'text' },
                ].map(({ key, label, type, onChange }) => (
                  <div key={key}>
                    <label className="block text-white/80 text-sm mb-2">{label}</label>
                    <input
                      type={type}
                      value={(brandForm as any)[key]}
                      onChange={e => onChange ? onChange(e.target.value) : setBrandForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-white/80 text-sm mb-2">Mô tả</label>
                  <textarea
                    value={brandForm.description}
                    onChange={e => setBrandForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setIsBrandModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">Hủy</button>
                  <button onClick={handleSaveBrand} className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all">Lưu</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Shipping Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {isShippingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsShippingModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 max-w-lg w-full border border-white/10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{editingShipping ? 'Chỉnh sửa vận chuyển' : 'Thêm phương thức vận chuyển'}</h2>
                <button onClick={() => setIsShippingModalOpen(false)} className="p-2 text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Tên phương thức *</label>
                  <input type="text" value={shippingForm.name} onChange={e => setShippingForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Mô tả</label>
                  <input type="text" value={shippingForm.description} onChange={e => setShippingForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Phí cơ bản (₫) *</label>
                    <input type="number" value={shippingForm.baseCost} onChange={e => setShippingForm(f => ({ ...f, baseCost: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Phí/km (₫) *</label>
                    <input type="number" value={shippingForm.costPerKm} onChange={e => setShippingForm(f => ({ ...f, costPerKm: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Freeship từ (₫) *</label>
                    <input type="number" value={shippingForm.freeThreshold} onChange={e => setShippingForm(f => ({ ...f, freeThreshold: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Thời gian giao *</label>
                    <input type="text" value={shippingForm.estimatedDays} onChange={e => setShippingForm(f => ({ ...f, estimatedDays: e.target.value }))} placeholder="VD: 3-5 ngày" className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setIsShippingModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">Hủy</button>
                  <button onClick={handleSaveShipping} className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl transition-all">Lưu</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Inventory Adjust Modal ──────────────────────────────── */}
      <AnimatePresence>
        {isAdjustModalOpen && adjustingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAdjustModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 max-w-md w-full border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Nhập thêm hàng</h2>
                <button onClick={() => setIsAdjustModalOpen(false)} className="p-2 text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-white/60 mb-4">{adjustingProduct.name}</p>
              <p className="text-sm text-white/40 mb-6">Tồn kho hiện tại: <span className="text-yellow-400 font-bold">{adjustingProduct.stock}</span></p>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Số lượng nhập *</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustQty}
                    onChange={e => setAdjustQty(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                    placeholder="VD: 10"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Ghi chú</label>
                  <input
                    type="text"
                    value={adjustNotes}
                    onChange={e => setAdjustNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                    placeholder="Lý do nhập hàng..."
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setIsAdjustModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl">Hủy</button>
                  <button onClick={handleAdjustStock} className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl">Xác nhận nhập</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingProduct && 'Chỉnh sửa sản phẩm'}
                  {editingBanner && 'Chỉnh sửa banner'}
                  {editingVoucher && 'Chỉnh sửa voucher'}
                  {editingEvent && 'Chỉnh sửa sự kiện'}
                  {editingLandingPage && 'Chỉnh sửa landing page'}
                  {!editingProduct && !editingBanner && !editingVoucher && !editingEvent && !editingLandingPage && 'Thêm mới'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="Nhập tiêu đề..."
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Mô tả</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                    placeholder="Nhập mô tả..."
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};