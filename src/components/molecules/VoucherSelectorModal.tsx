import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ticket, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { Voucher } from '@/app/context/AppContext';

interface VoucherSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  onSelect: (voucher: Voucher) => void;
  subtotal: number;
  selectedVoucherCode?: string;
}

export const VoucherSelectorModal: React.FC<VoucherSelectorModalProps> = ({
  isOpen,
  onClose,
  vouchers,
  onSelect,
  subtotal,
  selectedVoucherCode
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const filteredVouchers = vouchers
    .filter(v => !v.isUsed)
    .filter(v => 
      (v.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (v.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );

  const isEligible = (voucher: Voucher) => {
    return subtotal >= Number(voucher.minPurchase);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-amber-500" />
                  Chọn Voucher của bạn
                </h3>
                <p className="text-white/40 text-sm mt-1">Chọn mã giảm giá tốt nhất cho đơn hàng</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Tìm kiếm voucher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher) => {
                  const eligible = isEligible(voucher);
                  const isSelected = selectedVoucherCode === voucher.code;

                  return (
                    <motion.div
                      key={voucher.id}
                      whileHover={eligible ? { scale: 1.01 } : {}}
                      whileTap={eligible ? { scale: 0.99 } : {}}
                      onClick={() => eligible && onSelect(voucher)}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-500/10' 
                          : eligible 
                            ? 'border-white/10 bg-white/5 hover:border-white/30' 
                            : 'border-white/5 bg-white/[0.02] opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            eligible ? 'bg-amber-500 text-black' : 'bg-zinc-700 text-white/40'
                          }`}>
                            {voucher.code}
                          </span>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Đang áp dụng
                            </span>
                          )}
                        </div>
                        <p className="text-amber-500 font-bold text-lg">
                          {voucher.discountType === 'percentage' 
                            ? `-${voucher.discountValue}%` 
                            : `-${formatPrice(Number(voucher.discountValue))}`}
                        </p>
                      </div>

                      <h4 className="text-white font-semibold mb-1">{voucher.title}</h4>
                      <p className="text-white/40 text-xs mb-3 line-clamp-2">{voucher.description}</p>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 text-[10px]">
                        <div className="flex items-center gap-1 text-white/40">
                          <Clock className="w-3 h-3" />
                          <span>HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className={`flex items-center gap-1 font-medium ${
                          eligible ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {eligible ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đủ điều kiện</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              <span>Thiếu {formatPrice(Number(voucher.minPurchase) - subtotal)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className="py-12 text-center">
                  <Ticket className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40">Không tìm thấy voucher nào</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <button
                onClick={onClose}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
