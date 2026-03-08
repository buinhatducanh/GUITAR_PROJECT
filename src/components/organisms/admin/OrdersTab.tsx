import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Package, ChevronDown, ChevronUp, MapPin, Receipt, MessageSquare, Clock, CreditCard } from 'lucide-react';
import { ordersApi } from '@/app/lib/api';
import { toast } from 'sonner';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PROCESSING: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  SHIPPED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  DELIVERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Đã cập nhật trạng thái đơn hàng');
    } catch {
      toast.error('Cập nhật trạng thái thất bại');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Đơn hàng</h2>
          <p className="text-white/50 text-sm mt-1">{orders.length} đơn hàng tổng cộng</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </motion.button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
        >
          Tất cả ({orders.length})
        </button>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            {STATUS_LABELS[s]} ({orders.filter(o => o.status === s).length})
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <Package className="w-16 h-16 mb-4" />
          <p className="text-lg">Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="w-10 px-4 py-4"></th>
                  <th className="text-left px-6 py-4 text-white/50 text-sm font-medium">Mã đơn</th>
                  <th className="text-left px-6 py-4 text-white/50 text-sm font-medium">Khách hàng</th>
                  <th className="text-left px-6 py-4 text-white/50 text-sm font-medium">Sản phẩm</th>
                  <th className="text-left px-6 py-4 text-white/50 text-sm font-medium">Tổng tiền</th>
                  <th className="text-left px-6 py-4 text-white/50 text-sm font-medium">Trạng thái</th>
                  <th className="text-left px-6 py-4 text-white/50 text-sm font-medium">Ngày đặt</th>
                  <th className="text-left px-6 py-4 text-white/50 text-sm font-medium">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(order => (
                  <React.Fragment key={order.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-white/[0.04] transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-white/[0.02]' : ''}`}
                      onClick={() => toggleExpand(order.id)}
                    >
                      {/* Expand Toggle */}
                      <td className="px-4 py-4 text-white/40">
                        {expandedOrderId === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </td>
                      {/* Order number */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-amber-400 text-sm font-bold">{order.orderNumber}</span>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <p className="text-white text-sm font-medium">{order.user?.name || '—'}</p>
                        <p className="text-white/40 text-xs mt-0.5">{order.phone}</p>
                      </td>

                      {/* Items count */}
                      <td className="px-6 py-4">
                        <span className="text-white/70 text-sm">{order.items?.length ?? 0} sản phẩm</span>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4">
                        <span className="text-amber-400 font-semibold text-sm">{formatPrice(Number(order.totalAmount))}</span>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[order.status as OrderStatus] ?? 'bg-white/10 text-white/60 border-white/20'}`}>
                          {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <span className="text-white/50 text-xs">{formatDate(order.createdAt)}</span>
                      </td>

                      {/* Status update */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={e => {
                              e.stopPropagation();
                              handleStatusChange(order.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={updating === order.id}
                            className="bg-zinc-800 border border-white/10 rounded-lg px-2 py-1.5 text-white/80 text-xs focus:outline-none focus:border-purple-500 disabled:opacity-50 cursor-pointer relative z-10"
                          >
                            {ALL_STATUSES.map(s => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded Detail Row */}
                    <AnimatePresence>
                      {expandedOrderId === order.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={8} className="p-0 border-b border-white/5">
                            <div className="bg-zinc-950/50 p-6 shadow-inner">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Left Column: Items & Financials */}
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="flex items-center gap-2 text-white/80 font-semibold mb-4">
                                      <Receipt className="w-4 h-4 text-purple-400" />
                                      Danh sách sản phẩm
                                    </h3>
                                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                      <table className="w-full text-sm">
                                        <thead className="bg-white/5">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-white/60 font-medium">Sản phẩm</th>
                                            <th className="px-4 py-2 text-right text-white/60 font-medium">Đơn giá</th>
                                            <th className="px-4 py-2 text-center text-white/60 font-medium">SL</th>
                                            <th className="px-4 py-2 text-right text-white/60 font-medium">Thành tiền</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                          {order.items?.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                              <td className="px-4 py-3 text-white/90 font-medium">{item.name}</td>
                                              <td className="px-4 py-3 text-right text-white/60">{formatPrice(Number(item.price))}</td>
                                              <td className="px-4 py-3 text-center text-white/60">{item.quantity}</td>
                                              <td className="px-4 py-3 text-right text-amber-400 font-medium">
                                                {formatPrice(Number(item.price) * item.quantity)}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2 text-sm">
                                    <div className="flex justify-between text-white/60">
                                      <span>Tạm tính ({order.items?.length || 0} sản phẩm):</span>
                                      <span>{formatPrice(Number(order.totalAmount) + (Number(order.discountAmount) || 0))}</span>
                                    </div>

                                    {Number(order.discountAmount) > 0 && (
                                      <div className="flex justify-between text-green-400">
                                        <span>
                                          Giảm giá
                                          {order.voucherCode && <span className="ml-1 px-1.5 py-0.5 bg-green-500/20 rounded text-xs">Mã: {order.voucherCode}</span>}
                                        </span>
                                        <span>-{formatPrice(Number(order.discountAmount))}</span>
                                      </div>
                                    )}

                                    <div className="pt-2 mt-2 border-t border-white/10 flex justify-between items-center">
                                      <span className="text-white font-medium">Tổng thanh toán:</span>
                                      <span className="text-xl font-bold text-amber-500">{formatPrice(Number(order.totalAmount))}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column: Customer Info & Notes */}
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="flex items-center gap-2 text-white/80 font-semibold mb-4">
                                      <MapPin className="w-4 h-4 text-blue-400" />
                                      Thông tin giao hàng
                                    </h3>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3 text-sm">
                                      <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-white/50">Khách hàng:</span>
                                        <span className="text-white font-medium">{order.user?.name || 'Khách vãng lai'}</span>
                                      </div>
                                      <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-white/50">Điện thoại:</span>
                                        <span className="text-white font-medium">{order.phone}</span>
                                      </div>
                                      <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-white/50">Email:</span>
                                        <span className="text-white">{order.user?.email || '—'}</span>
                                      </div>
                                      <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-white/50">Địa chỉ:</span>
                                        <span className="text-white leading-relaxed">{order.address}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {order.notes && (
                                    <div>
                                      <h3 className="flex items-center gap-2 text-white/80 font-semibold mb-3">
                                        <MessageSquare className="w-4 h-4 text-amber-400" />
                                        Ghi chú của khách
                                      </h3>
                                      <div className="bg-amber-500/10 text-amber-200/90 rounded-xl p-4 border border-amber-500/20 text-sm whitespace-pre-wrap">
                                        {order.notes}
                                      </div>
                                    </div>
                                  )}

                                  <div>
                                    <h3 className="flex items-center gap-2 text-white/80 font-semibold mb-3">
                                      <Clock className="w-4 h-4 text-zinc-400" />
                                      Dấu thời gian
                                    </h3>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-white/50">Ngày đặt hàng:</span>
                                        <span className="text-white">{formatDate(order.createdAt)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-white/50">Cập nhật lần cuối:</span>
                                        <span className="text-white">{formatDate(order.updatedAt)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
