import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, ShoppingCart, Package, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi } from '@/app/lib/api';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const tickFormatter = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}tr` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}k` : `${v}`;

const getMockRevenueData = (period: string) => {
  if (period === 'day') return [{ name: '00:00', doanhthu: 2500000 }, { name: '04:00', doanhthu: 1800000 }, { name: '08:00', doanhthu: 4200000 }, { name: '12:00', doanhthu: 6800000 }, { name: '16:00', doanhthu: 5500000 }, { name: '20:00', doanhthu: 7200000 }];
  if (period === 'week') return [{ name: 'T2', doanhthu: 12000000 }, { name: 'T3', doanhthu: 15000000 }, { name: 'T4', doanhthu: 13500000 }, { name: 'T5', doanhthu: 18000000 }, { name: 'T6', doanhthu: 22000000 }, { name: 'T7', doanhthu: 25000000 }, { name: 'CN', doanhthu: 20000000 }];
  if (period === 'month') return [{ name: 'T1', doanhthu: 45000000 }, { name: 'T2', doanhthu: 52000000 }, { name: 'T3', doanhthu: 48000000 }, { name: 'T4', doanhthu: 61000000 }, { name: 'T5', doanhthu: 55000000 }, { name: 'T6', doanhthu: 67000000 }];
  return [{ name: 'Q1', doanhthu: 145000000 }, { name: 'Q2', doanhthu: 178000000 }, { name: 'Q3', doanhthu: 162000000 }, { name: 'Q4', doanhthu: 195000000 }];
};

const categoryData = [
  { name: 'Guitar Điện', value: 45, fill: '#f59e0b' },
  { name: 'Guitar Acoustic', value: 30, fill: '#3b82f6' },
  { name: 'Bass Guitar', value: 15, fill: '#8b5cf6' },
  { name: 'Amplifier', value: 10, fill: '#10b981' },
];

const periodLabels: Record<string, string> = { day: 'Ngày', week: 'Tuần', month: 'Tháng', year: 'Năm' };
const periodContextLabels: Record<string, string> = { day: 'hôm nay', week: 'tuần này', month: 'tháng này', year: 'năm nay' };

export const DashboardTab: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [overview, setOverview] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    analyticsApi.getOverview(period).then(setOverview).catch(() => {});
    analyticsApi.getRevenue(period)
      .then(d => { if (d?.data) setChartData(d.data.map((r: any) => ({ name: r.date, doanhthu: r.revenue }))); })
      .catch(() => {});
  }, [period]);

  const data = chartData.length > 0 ? chartData : getMockRevenueData(period);
  const pl = periodContextLabels[period];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {(['day', 'week', 'month', 'year'] as const).map((p) => (
          <motion.button
            key={p}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === p ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {periodLabels[p]}
          </motion.button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: DollarSign, label: `Doanh thu ${pl}`, value: overview ? formatPrice(overview.totalRevenue) : '—', from: 'from-blue-900/30', to: 'to-blue-800/30', border: 'border-blue-500/20', text: 'text-blue-200', iconColor: 'text-blue-400' },
          { icon: ShoppingCart, label: `Đơn hàng ${pl}`, value: overview?.totalOrders ?? '—', from: 'from-green-900/30', to: 'to-green-800/30', border: 'border-green-500/20', text: 'text-green-200', iconColor: 'text-green-400' },
          { icon: Package, label: 'Tổng sản phẩm', value: overview?.totalProducts ?? '—', from: 'from-purple-900/30', to: 'to-purple-800/30', border: 'border-purple-500/20', text: 'text-purple-200', iconColor: 'text-purple-400' },
          { icon: Users, label: `KH mới ${pl}`, value: overview?.totalCustomers ?? '—', from: 'from-orange-900/30', to: 'to-orange-800/30', border: 'border-orange-500/20', text: 'text-orange-200', iconColor: 'text-orange-400' },
        ].map(({ icon: Icon, label, value, from, to, border, text, iconColor }) => (
          <div key={label} className={`bg-gradient-to-br ${from} ${to} rounded-2xl p-6 border ${border}`}>
            <div className="flex items-center justify-between mb-4">
              <Icon className={`w-10 h-10 ${iconColor}`} />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className={`${text} text-sm mb-1`}>{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Biểu đồ doanh thu ({periodLabels[period]})</h3>
          <ResponsiveContainer width="100%" height={300}>
            {(period === 'month' || period === 'year') ? (
              <BarChart data={data} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#999" tick={{ fill: '#999', fontSize: 12 }} />
                <YAxis stroke="#999" tick={{ fill: '#999', fontSize: 12 }} tickFormatter={tickFormatter} width={48} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #444', borderRadius: '8px' }} labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }} itemStyle={{ color: '#f59e0b' }} formatter={(value: number) => [formatPrice(value), 'Doanh thu']} cursor={{ fill: 'rgba(245,158,11,0.08)' }} />
                <Bar dataKey="doanhthu" fill="url(#barGradient)" radius={[4, 4, 0, 0]}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#999" tick={{ fill: '#999', fontSize: 12 }} />
                <YAxis stroke="#999" tick={{ fill: '#999', fontSize: 12 }} tickFormatter={tickFormatter} width={48} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #444', borderRadius: '8px' }} labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }} itemStyle={{ color: '#f59e0b' }} formatter={(value: number) => [formatPrice(value), 'Doanh thu']} />
                <Line type="monotone" dataKey="doanhthu" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Phân loại sản phẩm</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #444', borderRadius: '8px' }} labelStyle={{ color: '#fff', fontWeight: 600 }} itemStyle={{ color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Đơn hàng gần đây</h3>
        {overview?.recentOrders?.length > 0 ? (
          <div className="space-y-3">
            {overview.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 truncate">{order.user?.name || 'Khách hàng'} — {formatPrice(parseFloat(order.totalAmount))}</p>
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
    </div>
  );
};
