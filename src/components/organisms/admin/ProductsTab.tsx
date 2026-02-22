import React from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { Product } from '@/app/context/AppContext';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

interface ProductsTabProps {
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  onAdd: () => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({ products, onDelete, onEdit, onAdd }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-white">Quản lý sản phẩm</h2>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
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
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
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
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(product)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(product.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
  </div>
);
