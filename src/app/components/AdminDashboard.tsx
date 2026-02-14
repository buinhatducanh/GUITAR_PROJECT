import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, BarChart3, Package, Users, FileText, Image,
  Star, Plus, Edit, Trash2, X, DollarSign, TrendingUp, ShoppingCart,
  Gift, Calendar, Award, Loader2, Upload
} from 'lucide-react';
import {
  useProducts, useDeleteProduct, useCreateProduct, useUpdateProduct,
  useBanners, useDeleteBanner, useCreateBanner, useUpdateBanner,
  useVouchers, useDeleteVoucher, useCreateVoucher, useUpdateVoucher,
  useEvents, useDeleteEvent, useCreateEvent, useUpdateEvent,
  useAllLandingPages, useDeleteLandingPage, useCreateLandingPage, useUpdateLandingPage,
  useOrders,
} from '../hooks/useQueries';
import { uploadApi } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

// ─── Form State Types ───────────────────────────
interface ProductForm {
  name: string; price: string; oldPrice: string; description: string;
  category: string; image: string; stock: string; featured: boolean;
}
interface BannerForm { title: string; subtitle: string; image: string; link: string; isActive: boolean; }
interface VoucherForm {
  code: string; title: string; description: string; discountType: string;
  discountValue: string; pointsCost: string; usageLimit: string; isActive: boolean;
  expiresAt: string; image: string;
}
interface EventForm {
  title: string; description: string; image: string; startDate: string;
  endDate: string; isActive: boolean; rewardType: string; rewardValue: string;
}
interface LandingPageForm {
  title: string; subtitle: string; slug: string; isPublished: boolean;
}

type ModalType = 'product' | 'banner' | 'voucher' | 'event' | 'landing' | null;

const emptyProductForm: ProductForm = { name: '', price: '', oldPrice: '', description: '', category: '', image: '', stock: '0', featured: false };
const emptyBannerForm: BannerForm = { title: '', subtitle: '', image: '', link: '', isActive: true };
const emptyVoucherForm: VoucherForm = { code: '', title: '', description: '', discountType: 'percentage', discountValue: '', pointsCost: '0', usageLimit: '100', isActive: true, expiresAt: '', image: '' };
const emptyEventForm: EventForm = { title: '', description: '', image: '', startDate: '', endDate: '', isActive: true, rewardType: 'points', rewardValue: '' };
const emptyLandingPageForm: LandingPageForm = { title: '', subtitle: '', slug: '', isPublished: false };

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // ─── React Query Data ────────────────────────
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 100 });
  const { data: banners = [], isLoading: bannersLoading } = useBanners();
  const { data: vouchers = [], isLoading: vouchersLoading } = useVouchers();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: landingPages = [], isLoading: landingLoading } = useAllLandingPages();
  const { data: ordersData } = useOrders();

  const products = productsData?.products || [];
  const orders = Array.isArray(ordersData) ? ordersData : [];

  // ─── Mutations ───────────────────────────────
  const deleteProduct = useDeleteProduct();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteBanner = useDeleteBanner();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteVoucher = useDeleteVoucher();
  const createVoucher = useCreateVoucher();
  const updateVoucher = useUpdateVoucher();
  const deleteEvent = useDeleteEvent();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteLandingPage = useDeleteLandingPage();
  const createLandingPage = useCreateLandingPage();
  const updateLandingPage = useUpdateLandingPage();

  // ─── UI State ────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dashboardPeriod, setDashboardPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // ─── Form States ─────────────────────────────
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [bannerForm, setBannerForm] = useState<BannerForm>(emptyBannerForm);
  const [voucherForm, setVoucherForm] = useState<VoucherForm>(emptyVoucherForm);
  const [eventForm, setEventForm] = useState<EventForm>(emptyEventForm);
  const [landingPageForm, setLandingPageForm] = useState<LandingPageForm>(emptyLandingPageForm);

  // ─── Analytics Data (mock) ───────────────────
  const getRevenueData = () => {
    if (dashboardPeriod === 'day') {
      return [
        { name: '00:00', doanhthu: 2500000 }, { name: '04:00', doanhthu: 1800000 },
        { name: '08:00', doanhthu: 4200000 }, { name: '12:00', doanhthu: 6800000 },
        { name: '16:00', doanhthu: 5500000 }, { name: '20:00', doanhthu: 7200000 }
      ];
    } else if (dashboardPeriod === 'week') {
      return [
        { name: 'T2', doanhthu: 12000000 }, { name: 'T3', doanhthu: 15000000 },
        { name: 'T4', doanhthu: 13500000 }, { name: 'T5', doanhthu: 18000000 },
        { name: 'T6', doanhthu: 22000000 }, { name: 'T7', doanhthu: 25000000 },
        { name: 'CN', doanhthu: 20000000 }
      ];
    } else if (dashboardPeriod === 'month') {
      return [
        { name: 'T1', doanhthu: 45000000 }, { name: 'T2', doanhthu: 52000000 },
        { name: 'T3', doanhthu: 48000000 }, { name: 'T4', doanhthu: 61000000 },
        { name: 'T5', doanhthu: 55000000 }, { name: 'T6', doanhthu: 67000000 }
      ];
    } else {
      return [
        { name: 'Q1', doanhthu: 145000000 }, { name: 'Q2', doanhthu: 178000000 },
        { name: 'Q3', doanhthu: 162000000 }, { name: 'Q4', doanhthu: 195000000 }
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
    { id: 'vouchers', label: 'Voucher', icon: Gift },
    { id: 'events', label: 'Sự kiện', icon: Calendar },
    { id: 'landing', label: 'Landing Pages', icon: FileText },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // ─── Image Upload Handler ────────────────────
  const handleImageUpload = async (file: File, folder: string): Promise<string> => {
    setIsUploading(true);
    try {
      const url = await uploadApi.uploadToCloudinary(file, folder);
      return url;
    } catch {
      toast.error('Upload ảnh thất bại');
      return '';
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Open Modal Handlers ─────────────────────
  const openProductModal = (product?: any) => {
    if (product) {
      setEditingId(product.id);
      setProductForm({
        name: product.name || '', price: String(product.price || ''), oldPrice: String(product.oldPrice || ''),
        description: product.description || '', category: product.category?.name || product.category || '',
        image: product.images?.[0] || product.image || '', stock: String(product.stock ?? 0), featured: product.featured || false,
      });
    } else {
      setEditingId(null);
      setProductForm(emptyProductForm);
    }
    setModalType('product');
    setIsModalOpen(true);
  };

  const openBannerModal = (banner?: any) => {
    if (banner) {
      setEditingId(banner.id);
      setBannerForm({ title: banner.title || '', subtitle: banner.subtitle || '', image: banner.image || '', link: banner.link || '', isActive: banner.isActive ?? true });
    } else {
      setEditingId(null);
      setBannerForm(emptyBannerForm);
    }
    setModalType('banner');
    setIsModalOpen(true);
  };

  const openVoucherModal = (voucher?: any) => {
    if (voucher) {
      setEditingId(voucher.id);
      setVoucherForm({
        code: voucher.code || '', title: voucher.title || '', description: voucher.description || '',
        discountType: voucher.discountType || 'percentage', discountValue: String(voucher.discountValue || ''),
        pointsCost: String(voucher.pointsCost || 0), usageLimit: String(voucher.usageLimit || 100),
        isActive: voucher.isActive ?? true, expiresAt: voucher.expiresAt?.split('T')[0] || '', image: voucher.image || '',
      });
    } else {
      setEditingId(null);
      setVoucherForm(emptyVoucherForm);
    }
    setModalType('voucher');
    setIsModalOpen(true);
  };

  const openEventModal = (event?: any) => {
    if (event) {
      setEditingId(event.id);
      setEventForm({
        title: event.title || '', description: event.description || '', image: event.image || '',
        startDate: event.startDate?.split('T')[0] || '', endDate: event.endDate?.split('T')[0] || '',
        isActive: event.isActive ?? true, rewardType: event.reward?.type || 'points', rewardValue: String(event.reward?.value || ''),
      });
    } else {
      setEditingId(null);
      setEventForm(emptyEventForm);
    }
    setModalType('event');
    setIsModalOpen(true);
  };

  const openLandingPageModal = (page?: any) => {
    if (page) {
      setEditingId(page.id);
      setLandingPageForm({ title: page.title || '', subtitle: page.subtitle || '', slug: page.slug || '', isPublished: page.isPublished ?? false });
    } else {
      setEditingId(null);
      setLandingPageForm(emptyLandingPageForm);
    }
    setModalType('landing');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingId(null);
  };

  // ─── Delete Handlers (with real API) ─────────
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Đã xóa sản phẩm');
    } catch { toast.error('Xóa sản phẩm thất bại'); }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteBanner.mutateAsync(id);
      toast.success('Đã xóa banner');
    } catch { toast.error('Xóa banner thất bại'); }
  };

  const handleDeleteVoucher = async (id: string) => {
    try {
      await deleteVoucher.mutateAsync(id);
      toast.success('Đã xóa voucher');
    } catch { toast.error('Xóa voucher thất bại'); }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id);
      toast.success('Đã xóa sự kiện');
    } catch { toast.error('Xóa sự kiện thất bại'); }
  };

  const handleDeleteLandingPage = async (id: string) => {
    try {
      await deleteLandingPage.mutateAsync(id);
      toast.success('Đã xóa landing page');
    } catch { toast.error('Xóa landing page thất bại'); }
  };

  // ─── Save Handler (Create / Update) ──────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (modalType === 'product') {
        const data = {
          name: productForm.name,
          price: Number(productForm.price),
          oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : undefined,
          description: productForm.description,
          category: productForm.category,
          images: productForm.image ? [productForm.image] : [],
          stock: Number(productForm.stock),
          featured: productForm.featured,
        };
        if (editingId) {
          await updateProduct.mutateAsync({ id: editingId, data });
          toast.success('Cập nhật sản phẩm thành công');
        } else {
          await createProduct.mutateAsync(data);
          toast.success('Thêm sản phẩm thành công');
        }
      } else if (modalType === 'banner') {
        const data = { title: bannerForm.title, subtitle: bannerForm.subtitle, image: bannerForm.image, link: bannerForm.link, isActive: bannerForm.isActive };
        if (editingId) {
          await updateBanner.mutateAsync({ id: editingId, data });
          toast.success('Cập nhật banner thành công');
        } else {
          await createBanner.mutateAsync(data);
          toast.success('Thêm banner thành công');
        }
      } else if (modalType === 'voucher') {
        const data = {
          code: voucherForm.code, title: voucherForm.title, description: voucherForm.description,
          discountType: voucherForm.discountType, discountValue: Number(voucherForm.discountValue),
          pointsCost: Number(voucherForm.pointsCost), usageLimit: Number(voucherForm.usageLimit),
          isActive: voucherForm.isActive, expiresAt: voucherForm.expiresAt ? new Date(voucherForm.expiresAt).toISOString() : undefined,
          image: voucherForm.image,
        };
        if (editingId) {
          await updateVoucher.mutateAsync({ id: editingId, data });
          toast.success('Cập nhật voucher thành công');
        } else {
          await createVoucher.mutateAsync(data);
          toast.success('Thêm voucher thành công');
        }
      } else if (modalType === 'event') {
        const data = {
          title: eventForm.title, description: eventForm.description, image: eventForm.image,
          startDate: new Date(eventForm.startDate).toISOString(), endDate: new Date(eventForm.endDate).toISOString(),
          isActive: eventForm.isActive,
          reward: { type: eventForm.rewardType, value: Number(eventForm.rewardValue) },
        };
        if (editingId) {
          await updateEvent.mutateAsync({ id: editingId, data });
          toast.success('Cập nhật sự kiện thành công');
        } else {
          await createEvent.mutateAsync(data);
          toast.success('Thêm sự kiện thành công');
        }
      } else if (modalType === 'landing') {
        const data = { title: landingPageForm.title, subtitle: landingPageForm.subtitle, slug: landingPageForm.slug, isPublished: landingPageForm.isPublished };
        if (editingId) {
          await updateLandingPage.mutateAsync({ id: editingId, data });
          toast.success('Cập nhật landing page thành công');
        } else {
          await createLandingPage.mutateAsync(data);
          toast.success('Thêm landing page thành công');
        }
      }
      closeModal();
    } catch (error: any) {
      toast.error(error.message || 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Loading Spinner ─────────────────────────
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
    </div>
  );

  // ─── Input Class ─────────────────────────────
  const inputClass = "w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors";

  // ─── Render Modal Content Based on Type ──────
  const renderModalContent = () => {
    if (modalType === 'product') return (
      <div className="space-y-4">
        <div>
          <label className="block text-white/80 mb-2">Tên sản phẩm *</label>
          <input type="text" className={inputClass} placeholder="Gibson Les Paul Standard..." value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 mb-2">Giá (VND) *</label>
            <input type="number" className={inputClass} placeholder="15000000" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
          </div>
          <div>
            <label className="block text-white/80 mb-2">Giá cũ (VND)</label>
            <input type="number" className={inputClass} placeholder="18000000" value={productForm.oldPrice} onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 mb-2">Danh mục</label>
            <input type="text" className={inputClass} placeholder="Guitar Điện" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} />
          </div>
          <div>
            <label className="block text-white/80 mb-2">Tồn kho</label>
            <input type="number" className={inputClass} placeholder="10" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-white/80 mb-2">Mô tả</label>
          <textarea rows={3} className={`${inputClass} resize-none`} placeholder="Mô tả sản phẩm..." value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-white/80 mb-2">URL Hình ảnh</label>
          <div className="flex gap-2">
            <input type="text" className={inputClass} placeholder="https://..." value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} />
            <label className="flex items-center gap-2 px-4 py-3 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 rounded-xl cursor-pointer transition-colors shrink-0">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <Upload className="w-4 h-4 text-purple-400" />}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) { const url = await handleImageUpload(file, 'guitar-nova/products'); if (url) setProductForm(f => ({ ...f, image: url })); }
              }} />
            </label>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })} className="rounded" />
          <span className="text-white/80">Sản phẩm nổi bật</span>
        </label>
      </div>
    );

    if (modalType === 'banner') return (
      <div className="space-y-4">
        <div>
          <label className="block text-white/80 mb-2">Tiêu đề *</label>
          <input type="text" className={inputClass} placeholder="Banner mùa hè..." value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-white/80 mb-2">Phụ đề</label>
          <input type="text" className={inputClass} placeholder="Giảm giá đến 50%..." value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} />
        </div>
        <div>
          <label className="block text-white/80 mb-2">URL Hình ảnh *</label>
          <div className="flex gap-2">
            <input type="text" className={inputClass} placeholder="https://..." value={bannerForm.image} onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })} />
            <label className="flex items-center gap-2 px-4 py-3 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 rounded-xl cursor-pointer transition-colors shrink-0">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <Upload className="w-4 h-4 text-purple-400" />}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) { const url = await handleImageUpload(file, 'guitar-nova/banners'); if (url) setBannerForm(f => ({ ...f, image: url })); }
              }} />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-white/80 mb-2">Link đích</label>
          <input type="text" className={inputClass} placeholder="/products" value={bannerForm.link} onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={bannerForm.isActive} onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })} className="rounded" />
          <span className="text-white/80">Đang hoạt động</span>
        </label>
      </div>
    );

    if (modalType === 'voucher') return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 mb-2">Mã voucher *</label>
            <input type="text" className={inputClass} placeholder="SUMMER2025" value={voucherForm.code} onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="block text-white/80 mb-2">Tiêu đề *</label>
            <input type="text" className={inputClass} placeholder="Giảm giá mùa hè" value={voucherForm.title} onChange={(e) => setVoucherForm({ ...voucherForm, title: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-white/80 mb-2">Mô tả</label>
          <textarea rows={2} className={`${inputClass} resize-none`} placeholder="Mô tả voucher..." value={voucherForm.description} onChange={(e) => setVoucherForm({ ...voucherForm, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 mb-2">Loại giảm giá</label>
            <select className={inputClass} value={voucherForm.discountType} onChange={(e) => setVoucherForm({ ...voucherForm, discountType: e.target.value })}>
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (VND)</option>
            </select>
          </div>
          <div>
            <label className="block text-white/80 mb-2">Giá trị giảm *</label>
            <input type="number" className={inputClass} placeholder={voucherForm.discountType === 'percentage' ? '10' : '100000'} value={voucherForm.discountValue} onChange={(e) => setVoucherForm({ ...voucherForm, discountValue: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-white/80 mb-2">Điểm đổi</label>
            <input type="number" className={inputClass} placeholder="500" value={voucherForm.pointsCost} onChange={(e) => setVoucherForm({ ...voucherForm, pointsCost: e.target.value })} />
          </div>
          <div>
            <label className="block text-white/80 mb-2">Giới hạn dùng</label>
            <input type="number" className={inputClass} placeholder="100" value={voucherForm.usageLimit} onChange={(e) => setVoucherForm({ ...voucherForm, usageLimit: e.target.value })} />
          </div>
          <div>
            <label className="block text-white/80 mb-2">Hạn sử dụng</label>
            <input type="date" className={inputClass} value={voucherForm.expiresAt} onChange={(e) => setVoucherForm({ ...voucherForm, expiresAt: e.target.value })} />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={voucherForm.isActive} onChange={(e) => setVoucherForm({ ...voucherForm, isActive: e.target.checked })} className="rounded" />
          <span className="text-white/80">Đang hoạt động</span>
        </label>
      </div>
    );

    if (modalType === 'event') return (
      <div className="space-y-4">
        <div>
          <label className="block text-white/80 mb-2">Tên sự kiện *</label>
          <input type="text" className={inputClass} placeholder="Festival Âm nhạc Mùa hè..." value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-white/80 mb-2">Mô tả</label>
          <textarea rows={3} className={`${inputClass} resize-none`} placeholder="Mô tả sự kiện..." value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-white/80 mb-2">URL Hình ảnh</label>
          <div className="flex gap-2">
            <input type="text" className={inputClass} placeholder="https://..." value={eventForm.image} onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })} />
            <label className="flex items-center gap-2 px-4 py-3 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 rounded-xl cursor-pointer transition-colors shrink-0">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <Upload className="w-4 h-4 text-purple-400" />}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) { const url = await handleImageUpload(file, 'guitar-nova/events'); if (url) setEventForm(f => ({ ...f, image: url })); }
              }} />
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 mb-2">Ngày bắt đầu *</label>
            <input type="date" className={inputClass} value={eventForm.startDate} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-white/80 mb-2">Ngày kết thúc *</label>
            <input type="date" className={inputClass} value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 mb-2">Loại phần thưởng</label>
            <select className={inputClass} value={eventForm.rewardType} onChange={(e) => setEventForm({ ...eventForm, rewardType: e.target.value })}>
              <option value="points">Điểm thưởng</option>
              <option value="discount">Giảm giá (%)</option>
            </select>
          </div>
          <div>
            <label className="block text-white/80 mb-2">Giá trị thưởng</label>
            <input type="number" className={inputClass} placeholder="500" value={eventForm.rewardValue} onChange={(e) => setEventForm({ ...eventForm, rewardValue: e.target.value })} />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={eventForm.isActive} onChange={(e) => setEventForm({ ...eventForm, isActive: e.target.checked })} className="rounded" />
          <span className="text-white/80">Đang diễn ra</span>
        </label>
      </div>
    );

    if (modalType === 'landing') return (
      <div className="space-y-4">
        <div>
          <label className="block text-white/80 mb-2">Tiêu đề *</label>
          <input type="text" className={inputClass} placeholder="Bộ sưu tập mới..." value={landingPageForm.title} onChange={(e) => setLandingPageForm({ ...landingPageForm, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-white/80 mb-2">Phụ đề</label>
          <input type="text" className={inputClass} placeholder="Khám phá ngay..." value={landingPageForm.subtitle} onChange={(e) => setLandingPageForm({ ...landingPageForm, subtitle: e.target.value })} />
        </div>
        <div>
          <label className="block text-white/80 mb-2">Slug *</label>
          <input type="text" className={inputClass} placeholder="bo-suu-tap-moi" value={landingPageForm.slug} onChange={(e) => setLandingPageForm({ ...landingPageForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={landingPageForm.isPublished} onChange={(e) => setLandingPageForm({ ...landingPageForm, isPublished: e.target.checked })} className="rounded" />
          <span className="text-white/80">Xuất bản</span>
        </label>
      </div>
    );

    return null;
  };

  const getModalTitle = () => {
    const prefix = editingId ? 'Chỉnh sửa' : 'Thêm';
    const labels: Record<string, string> = { product: 'sản phẩm', banner: 'banner', voucher: 'voucher', event: 'sự kiện', landing: 'landing page' };
    return `${prefix} ${labels[modalType || ''] || ''}`;
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
              {/* ═══ DASHBOARD TAB ═══ */}
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  {/* Period Selector */}
                  <div className="flex gap-2 mb-6">
                    {(['day', 'week', 'month', 'year'] as const).map((period) => (
                      <motion.button key={period} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setDashboardPeriod(period)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${dashboardPeriod === period ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                        {{ day: 'Ngày', week: 'Tuần', month: 'Tháng', year: 'Năm' }[period]}
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
                      <p className="text-2xl font-bold text-white">{orders.length}</p>
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
                        <Gift className="w-10 h-10 text-orange-400" />
                        <span className="text-orange-400 text-sm font-medium">{(vouchers as any[]).length}</span>
                      </div>
                      <p className="text-orange-200 text-sm mb-1">Voucher đang có</p>
                      <p className="text-2xl font-bold text-white">{(vouchers as any[]).length}</p>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-6">
                        Biểu đồ doanh thu ({{ day: 'Ngày', week: 'Tuần', month: 'Tháng', year: 'Năm' }[dashboardPeriod]})
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getRevenueData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#999" />
                          <YAxis stroke="#999" />
                          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333' }} labelStyle={{ color: '#fff' }} formatter={(value: number) => formatPrice(value)} />
                          <Line type="monotone" dataKey="doanhthu" stroke="#f59e0b" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-6">Phân loại sản phẩm</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                            {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ PRODUCTS TAB ═══ */}
              {activeTab === 'products' && (
                <motion.div key="products" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý sản phẩm ({products.length})</h2>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openProductModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
                      <Plus className="w-5 h-5" /> Thêm sản phẩm
                    </motion.button>
                  </div>
                  {productsLoading ? <LoadingSpinner /> : (
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/10 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="px-6 py-4 text-left text-white/80 font-medium">Sản phẩm</th>
                              <th className="px-6 py-4 text-left text-white/80 font-medium">Danh mục</th>
                              <th className="px-6 py-4 text-left text-white/80 font-medium">Giá</th>
                              <th className="px-6 py-4 text-left text-white/80 font-medium">Tồn kho</th>
                              <th className="px-6 py-4 text-right text-white/80 font-medium">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {products.map((product: any) => (
                              <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img src={product.images?.[0] || product.image || '/placeholder.png'} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                                    <div>
                                      <p className="text-white font-medium line-clamp-1">{product.name}</p>
                                      <p className="text-white/40 text-sm">{product.slug}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-white/60">{product.category?.name || product.category || '—'}</td>
                                <td className="px-6 py-4"><p className="text-amber-500 font-medium">{formatPrice(product.price)}</p></td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${product.stock > 10 ? 'bg-green-500/20 text-green-400' : product.stock > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {product.stock ?? '—'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end gap-2">
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openProductModal(product)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></motion.button>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></motion.button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ BANNERS TAB ═══ */}
              {activeTab === 'banners' && (
                <motion.div key="banners" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý Banner</h2>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openBannerModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
                      <Plus className="w-5 h-5" /> Thêm banner
                    </motion.button>
                  </div>
                  {bannersLoading ? <LoadingSpinner /> : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {(banners as any[]).map((banner: any) => (
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
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openBannerModal(banner)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteBanner(banner.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ VOUCHERS TAB ═══ */}
              {activeTab === 'vouchers' && (
                <motion.div key="vouchers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý Voucher</h2>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openVoucherModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
                      <Plus className="w-5 h-5" /> Thêm voucher
                    </motion.button>
                  </div>
                  {vouchersLoading ? <LoadingSpinner /> : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(vouchers as any[]).map((voucher: any) => (
                        <div key={voucher.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-amber-500/20">
                          {voucher.image && (
                            <div className="relative h-32">
                              <img src={voucher.image} alt={voucher.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${voucher.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {voucher.isActive ? 'Hoạt động' : 'Tạm dừng'}
                              </div>
                            </div>
                          )}
                          <div className="p-5">
                            <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg mb-3">
                              <span className="text-amber-400 font-mono font-bold text-sm">{voucher.code}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{voucher.title}</h3>
                            <div className="flex items-center gap-2 text-amber-400 mb-3">
                              <Star className="w-5 h-5 fill-amber-400" />
                              <span className="font-bold">{(voucher.pointsCost || 0).toLocaleString('vi-VN')} điểm</span>
                            </div>
                            <p className="text-xs text-white/50 mb-4">
                              Đã dùng: {voucher.usedCount || 0}/{voucher.usageLimit || '∞'}
                            </p>
                            <div className="flex gap-2">
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openVoucherModal(voucher)} className="flex-1 py-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-sm">Chỉnh sửa</motion.button>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteVoucher(voucher.id)} className="flex-1 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm">Xóa</motion.button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ EVENTS TAB ═══ */}
              {activeTab === 'events' && (
                <motion.div key="events" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý Sự kiện</h2>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openEventModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
                      <Plus className="w-5 h-5" /> Thêm sự kiện
                    </motion.button>
                  </div>
                  {eventsLoading ? <LoadingSpinner /> : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {(events as any[]).map((event: any) => (
                        <div key={event.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-white/10">
                          {event.image && (
                            <div className="relative h-48">
                              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${event.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {event.isActive ? 'Đang diễn ra' : 'Tạm dừng'}
                              </div>
                            </div>
                          )}
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                            <p className="text-white/60 text-sm mb-3 line-clamp-2">{event.description}</p>
                            <div className="flex items-center gap-2 text-amber-400 mb-3">
                              <Award className="w-5 h-5" />
                              <span className="text-sm">
                                {event.reward?.type === 'points' && `+${event.reward.value} điểm`}
                                {event.reward?.type === 'discount' && `Giảm ${event.reward.value}%`}
                              </span>
                            </div>
                            {event.startDate && (
                              <p className="text-xs text-white/40 mb-4">
                                {formatDate(event.startDate)} - {formatDate(event.endDate)}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openEventModal(event)} className="flex-1 py-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-sm">Chỉnh sửa</motion.button>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteEvent(event.id)} className="flex-1 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm">Xóa</motion.button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ LANDING PAGES TAB ═══ */}
              {activeTab === 'landing' && (
                <motion.div key="landing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Quản lý Landing Pages</h2>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openLandingPageModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
                      <Plus className="w-5 h-5" /> Thêm landing page
                    </motion.button>
                  </div>
                  {landingLoading ? <LoadingSpinner /> : (
                    <div className="space-y-4">
                      {(landingPages as any[]).map((page: any) => (
                        <div key={page.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-white">{page.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${page.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                                  {page.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                                </span>
                              </div>
                              <p className="text-white/60 mb-2">{page.subtitle}</p>
                              <p className="text-white/40 text-sm">Slug: {page.slug}</p>
                              {page.createdAt && <p className="text-white/40 text-sm">Ngày tạo: {formatDate(page.createdAt)}</p>}
                            </div>
                            <div className="flex gap-2">
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openLandingPageModal(page)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></motion.button>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteLandingPage(page.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></motion.button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ ORDERS TAB ═══ */}
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <h2 className="text-2xl font-bold text-white mb-6">Quản lý Đơn hàng ({orders.length})</h2>
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Mã đơn</th>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Khách hàng</th>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Tổng tiền</th>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Trạng thái</th>
                            <th className="px-6 py-4 text-left text-white/80 font-medium">Ngày đặt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {orders.map((order: any) => {
                            const statusMap: Record<string, { label: string; color: string }> = {
                              PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-500/20 text-yellow-400' },
                              CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-500/20 text-blue-400' },
                              PROCESSING: { label: 'Đang xử lý', color: 'bg-purple-500/20 text-purple-400' },
                              SHIPPED: { label: 'Đang giao', color: 'bg-orange-500/20 text-orange-400' },
                              DELIVERED: { label: 'Đã giao', color: 'bg-green-500/20 text-green-400' },
                              CANCELLED: { label: 'Đã hủy', color: 'bg-red-500/20 text-red-400' },
                            };
                            const st = statusMap[order.status] || { label: order.status, color: 'bg-zinc-500/20 text-zinc-400' };
                            return (
                              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-white font-mono">#{order.orderNumber}</td>
                                <td className="px-6 py-4 text-white/60">{order.user?.name || order.userId}</td>
                                <td className="px-6 py-4 text-amber-500 font-medium">{formatPrice(order.totalAmount)}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                                </td>
                                <td className="px-6 py-4 text-white/40 text-sm">{formatDate(order.createdAt)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══ MODAL ═══ */}
      <AnimatePresence>
        {isModalOpen && modalType && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{getModalTitle()}</h2>
                <button onClick={closeModal} className="p-2 text-white/60 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {renderModalContent()}

              <div className="flex gap-4 mt-6">
                <button onClick={closeModal} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">Hủy</button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
