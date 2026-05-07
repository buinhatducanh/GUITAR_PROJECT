import React from 'react';
import { motion } from 'motion/react';
import {
  BarChart3, Package, Users, FileText, Image, Star,
  Gift, Calendar, Award, Settings as SettingsIcon, Truck, Warehouse, ShoppingBag, FolderTree, Bell, Newspaper,
} from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'products', label: 'Sản phẩm', icon: Package },
  { id: 'categories', label: 'Danh mục', icon: FolderTree },
  { id: 'brands', label: 'Thương hiệu', icon: Award },
  { id: 'inventory', label: 'Kho hàng', icon: Warehouse },
  { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
  { id: 'banners', label: 'Banner', icon: Image },
  { id: 'users', label: 'Người dùng', icon: Users },
  { id: 'reviews', label: 'Đánh giá', icon: Star },
  { id: 'vouchers', label: 'Voucher', icon: Gift },
  { id: 'events', label: 'Sự kiện', icon: Calendar },
  { id: 'shipping', label: 'Vận chuyển', icon: Truck },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'settings', label: 'Cài đặt', icon: SettingsIcon },
  { id: 'landing', label: 'Landing Pages', icon: FileText },
  { id: 'blog', label: 'Blog Posts', icon: FileText },
  { id: 'post-test', label: 'Post Test', icon: Newspaper },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => (
  <div className="lg:w-64 shrink-0">
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-4 border border-white/10 sticky top-24">
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ x: 5 }}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
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
);
