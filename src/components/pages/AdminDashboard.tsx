import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/app/context/AppContext';
import { toast } from 'sonner';

import { AdminSidebar } from '@/components/organisms/admin/AdminSidebar';
import { DashboardTab } from '@/components/organisms/admin/DashboardTab';
import { ProductsTab } from '@/components/organisms/admin/ProductsTab';
import { BrandsTab } from '@/components/organisms/admin/BrandsTab';
import { InventoryTab } from '@/components/organisms/admin/InventoryTab';
import { BannersTab } from '@/components/organisms/admin/BannersTab';
import { UsersTab } from '@/components/organisms/admin/UsersTab';
import { ReviewsTab } from '@/components/organisms/admin/ReviewsTab';
import { VouchersTab } from '@/components/organisms/admin/VouchersTab';
import { EventsTab } from '@/components/organisms/admin/EventsTab';
import { ShippingTab } from '@/components/organisms/admin/ShippingTab';
import { SettingsTab } from '@/components/organisms/admin/SettingsTab';
import { LandingPagesTab } from '@/components/organisms/admin/LandingPagesTab';
import { BlogPostsTab } from '@/components/organisms/admin/BlogPostsTab';
import { OrdersTab } from '@/components/organisms/admin/OrdersTab';
import { useSettingsStore } from '@/features/settings/store/settingsStore';

const tabAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const settings = useSettingsStore((state) => state.settings);
  const {
    products, setProducts,
    vouchers, setVouchers,
    events, setEvents,
    users, setUsers,
    allReviews, setAllReviews,
    landingPages, setLandingPages,
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');

  const deleteFrom = <T extends { id: string }>(items: T[], setItems: (v: T[]) => void, label: string) =>
    (id: string) => { setItems(items.filter(i => i.id !== id)); toast.success(`Đã xóa ${label}`); };

  const stubEdit = () => toast.success('Chức năng chỉnh sửa chi tiết đang phát triển');
  const stubAdd = () => toast.success('Chức năng thêm mới đang phát triển');

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
          <p className="text-purple-300">Quản lý toàn bộ hệ thống {settings?.siteName || 'Guitar NOVA'}</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && <motion.div key="dashboard" {...tabAnimation}><DashboardTab /></motion.div>}
              {activeTab === 'products' && <motion.div key="products" {...tabAnimation}><ProductsTab products={products} onDelete={deleteFrom(products, setProducts, 'sản phẩm')} onEdit={stubEdit} onAdd={stubAdd} /></motion.div>}
              {activeTab === 'brands' && <motion.div key="brands" {...tabAnimation}><BrandsTab /></motion.div>}
              {activeTab === 'inventory' && <motion.div key="inventory" {...tabAnimation}><InventoryTab /></motion.div>}
              {activeTab === 'orders' && <motion.div key="orders" {...tabAnimation}><OrdersTab /></motion.div>}
              {activeTab === 'banners' && <motion.div key="banners" {...tabAnimation}><BannersTab /></motion.div>}
              {activeTab === 'users' && <motion.div key="users" {...tabAnimation}><UsersTab users={users} onDelete={deleteFrom(users, setUsers, 'người dùng')} /></motion.div>}
              {activeTab === 'reviews' && <motion.div key="reviews" {...tabAnimation}><ReviewsTab reviews={allReviews} onDelete={deleteFrom(allReviews, setAllReviews, 'đánh giá')} /></motion.div>}
              {activeTab === 'vouchers' && <motion.div key="vouchers" {...tabAnimation}><VouchersTab vouchers={vouchers} onDelete={deleteFrom(vouchers, setVouchers, 'voucher')} onEdit={stubEdit} onAdd={stubAdd} /></motion.div>}
              {activeTab === 'events' && <motion.div key="events" {...tabAnimation}><EventsTab events={events} onDelete={deleteFrom(events, setEvents, 'sự kiện')} onEdit={stubEdit} onAdd={stubAdd} /></motion.div>}
              {activeTab === 'shipping' && <motion.div key="shipping" {...tabAnimation}><ShippingTab /></motion.div>}
              {activeTab === 'settings' && <motion.div key="settings" {...tabAnimation}><SettingsTab /></motion.div>}
              {activeTab === 'landing' && <motion.div key="landing" {...tabAnimation}><LandingPagesTab pages={landingPages} onDelete={deleteFrom(landingPages, setLandingPages, 'landing page')} onEdit={stubEdit} onAdd={stubAdd} /></motion.div>}
              {activeTab === 'blog' && <motion.div key="blog" {...tabAnimation}><BlogPostsTab /></motion.div>}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
