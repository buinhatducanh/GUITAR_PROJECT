import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, BarChart3, Package, Users, FileText, Image,
  Star, Plus, Edit, Trash2, X, DollarSign, TrendingUp, ShoppingCart,
  Gift, Calendar, Award, Settings as SettingsIcon
} from 'lucide-react';
import { useApp, Product, Banner, Voucher, Event, UserData, Review, LandingPageData, BlogPost } from '../context/AppContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
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
    { id: 'banners', label: 'Banner', icon: Image },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'reviews', label: 'Đánh giá', icon: Star },
    { id: 'vouchers', label: 'Voucher', icon: Gift },
    { id: 'events', label: 'Sự kiện', icon: Calendar },
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
            onClick={() => navigate('/')}
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
                        <span className="text-green-400 text-sm font-medium">+12.5%</span>
                      </div>
                      <p className="text-blue-200 text-sm mb-1">Doanh thu tháng này</p>
                      <p className="text-2xl font-bold text-white">67,5 triệu</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-2xl p-6 border border-green-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <ShoppingCart className="w-10 h-10 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">+8.2%</span>
                      </div>
                      <p className="text-green-200 text-sm mb-1">Đơn hàng</p>
                      <p className="text-2xl font-bold text-white">124</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-6 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <Package className="w-10 h-10 text-purple-400" />
                        <span className="text-purple-400 text-sm font-medium">{products.length}</span>
                      </div>
                      <p className="text-purple-200 text-sm mb-1">Sản phẩm</p>
                      <p className="text-2xl font-bold text-white">{products.length}</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-2xl p-6 border border-orange-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <Users className="w-10 h-10 text-orange-400" />
                        <span className="text-orange-400 text-sm font-medium">+15.3%</span>
                      </div>
                      <p className="text-orange-200 text-sm mb-1">Khách hàng</p>
                      <p className="text-2xl font-bold text-white">{users.length}</p>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-6">
                        Biểu đồ doanh thu ({dashboardPeriod === 'day' ? 'Ngày' : dashboardPeriod === 'week' ? 'Tuần' : dashboardPeriod === 'month' ? 'Tháng' : 'Năm'})
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getRevenueData()}>
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

                  {/* Recent Activity */}
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Hoạt động gần đây</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <p className="text-white/80">Đơn hàng mới #124 - {formatPrice(15000000)}</p>
                        <span className="text-white/40 text-sm ml-auto">5 phút trước</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <p className="text-white/80">Người dùng mới đăng ký: Nguyễn Văn A</p>
                        <span className="text-white/40 text-sm ml-auto">15 phút trước</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                        <p className="text-white/80">Đánh giá mới: 5 sao cho Fender Stratocaster</p>
                        <span className="text-white/40 text-sm ml-auto">30 phút trước</span>
                      </div>
                    </div>
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
            </AnimatePresence>
          </div>
        </div>
      </div>

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