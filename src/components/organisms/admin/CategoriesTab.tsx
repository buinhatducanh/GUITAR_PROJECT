import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Plus, Edit, Trash2, FolderTree, Package, ChevronRight,
    Guitar, Music, Radio, Zap, Headphones, Mic, Speaker, Disc3, Cable, Sliders, Volume2, Drum
} from 'lucide-react';
import { toast } from 'sonner';
import { categoriesApi } from '@/app/lib/api';
import { AdminModal } from '@/components/molecules/AdminModal';

const ICON_OPTIONS = [
    { name: 'Package', icon: Package },
    { name: 'Guitar', icon: Guitar },
    { name: 'Zap', icon: Zap },
    { name: 'Music', icon: Music },
    { name: 'Radio', icon: Radio },
    { name: 'Headphones', icon: Headphones },
    { name: 'Mic', icon: Mic },
    { name: 'Speaker', icon: Speaker },
    { name: 'Disc3', icon: Disc3 },
    { name: 'Cable', icon: Cable },
    { name: 'Sliders', icon: Sliders },
    { name: 'Volume2', icon: Volume2 },
    { name: 'Drum', icon: Drum },
    { name: 'FolderTree', icon: FolderTree },
];

export const ICON_MAP: Record<string, React.FC<any>> = Object.fromEntries(
    ICON_OPTIONS.map(o => [o.name, o.icon])
);

export const CategoriesTab: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: '', slug: '', parentId: '', icon: 'Package' });

    const load = async () => {
        try {
            const [tree, flat] = await Promise.all([categoriesApi.getTree(), categoriesApi.getAll()]);
            setCategories(tree);
            setAllCategories(flat);
        } catch { toast.error('Không thể tải danh sách danh mục'); }
    };

    useEffect(() => { load(); }, []);

    const openModal = (cat?: any) => {
        if (cat) {
            setEditing(cat);
            setForm({ name: cat.name, slug: cat.slug, parentId: cat.parentId || '', icon: cat.icon || 'Package' });
        } else {
            setEditing(null);
            setForm({ name: '', slug: '', parentId: '', icon: 'Package' });
        }
        setIsModalOpen(true);
    };

    const handleNameChange = (name: string) => {
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        setForm(f => ({
            ...f,
            name,
            slug: f.slug === '' || f.slug === f.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ? slug : f.slug,
        }));
    };

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error('Tên danh mục không được để trống'); return; }
        try {
            const payload = { name: form.name, parentId: form.parentId || null, icon: form.icon };
            if (editing) {
                await categoriesApi.update(editing.id, payload);
                toast.success('Đã cập nhật danh mục');
            } else {
                await categoriesApi.create(payload);
                toast.success('Đã thêm danh mục');
            }
            setIsModalOpen(false);
            load();
        } catch (e: any) { toast.error(e.message || 'Lỗi khi lưu danh mục'); }
    };

    const handleDelete = async (id: string) => {
        try {
            await categoriesApi.delete(id);
            toast.success('Đã xóa danh mục');
            load();
        } catch (e: any) { toast.error(e.message || 'Không thể xóa danh mục đang có sản phẩm'); }
    };

    const getIcon = (iconName?: string) => ICON_MAP[iconName || 'Package'] || Package;
    const totalProducts = allCategories.reduce((sum, c) => sum + (c._count?.products ?? 0), 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Quản lý Danh Mục</h2>
                    <p className="text-white/40 text-sm mt-1">{allCategories.length} danh mục · {totalProducts} sản phẩm</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all">
                    <Plus className="w-5 h-5" />
                    Thêm danh mục
                </motion.button>
            </div>

            {categories.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                    <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Chưa có danh mục nào. Nhấn "Thêm danh mục" để bắt đầu.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {categories.map((cat) => {
                        const CatIcon = getIcon(cat.icon);
                        return (
                            <div key={cat.id}>
                                {/* Parent category */}
                                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-5 border border-white/10 hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                <CatIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                                                <p className="text-white/40 text-xs">/{cat.slug} · icon: {cat.icon || 'Package'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-white/60">
                                                <Package className="w-4 h-4 text-indigo-400" />
                                                <span className="font-semibold text-white">{cat._count?.products ?? 0}</span>
                                                <span className="text-sm">sản phẩm</span>
                                            </div>
                                            {cat.children?.length > 0 && (
                                                <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full font-medium">
                                                    {cat.children.length} danh mục con
                                                </span>
                                            )}
                                            <div className="flex gap-1">
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openModal(cat)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(cat.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Child categories */}
                                {cat.children?.length > 0 && (
                                    <div className="ml-8 mt-2 space-y-2">
                                        {cat.children.map((child: any) => {
                                            const ChildIcon = getIcon(child.icon);
                                            return (
                                                <div key={child.id} className="bg-zinc-900/60 rounded-xl p-4 border border-white/5 hover:border-indigo-500/20 transition-all flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <ChevronRight className="w-4 h-4 text-white/20" />
                                                        <ChildIcon className="w-4 h-4 text-indigo-400" />
                                                        <div>
                                                            <h4 className="text-white font-medium">{child.name}</h4>
                                                            <p className="text-white/30 text-xs">/{child.slug}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1 text-white/50 text-sm">
                                                            <Package className="w-3 h-3" />
                                                            <span>{child._count?.products ?? 0}</span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openModal(child)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </motion.button>
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(child.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Tên danh mục *</label>
                        <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500/50" placeholder="VD: Guitar Điện" />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Slug</label>
                        <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500/50" placeholder="auto-generated" />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Icon</label>
                        <div className="grid grid-cols-7 gap-2">
                            {ICON_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                const isSelected = form.icon === opt.name;
                                return (
                                    <motion.button
                                        key={opt.name}
                                        type="button"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setForm(f => ({ ...f, icon: opt.name }))}
                                        className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${isSelected
                                                ? 'bg-indigo-600 text-white border-2 border-indigo-400'
                                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border-2 border-transparent'
                                            }`}
                                        title={opt.name}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[10px] truncate w-full text-center">{opt.name}</span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Danh mục cha</label>
                        <select value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50">
                            <option value="">— Không (danh mục gốc) —</option>
                            {allCategories.filter(c => !c.parentId && c.id !== editing?.id).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">Hủy</button>
                        <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl transition-all">Lưu</button>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
};
