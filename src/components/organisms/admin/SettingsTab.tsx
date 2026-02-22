import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Users, Image, TrendingUp, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { settingsApi } from '@/app/lib/api';
import { ImageUploadField } from '@/components/molecules/ImageUploadField';

export const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    settingsApi.get().then(setSettings).catch(() => toast.error('Không thể tải cài đặt'));
  }, []);

  const handleSave = async () => {
    try {
      await settingsApi.update(settings);
      toast.success('Đã lưu cài đặt');
    } catch (e: any) { toast.error(e.message || 'Lỗi khi lưu cài đặt'); }
  };

  const update = (key: string, value: string) => setSettings((s: any) => ({ ...s, [key]: value }));
  const inputCls = (color: string) => `w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-${color}-500 focus:outline-none`;

  if (!settings) return <div className="text-center py-16 text-white/40">Đang tải cài đặt...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Cài Đặt Website</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
          Lưu cài đặt
        </motion.button>
      </div>

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
              <input type="text" value={settings.siteName || ''} onChange={e => update('siteName', e.target.value)} className={inputCls('purple')} />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Slogan</label>
              <input type="text" value={settings.slogan || ''} onChange={e => update('slogan', e.target.value)} className={inputCls('purple')} />
            </div>
            <ImageUploadField value={settings.logo || ''} onChange={url => update('logo', url)} label="Logo cửa hàng" />
            <ImageUploadField value={settings.favicon || ''} onChange={url => update('favicon', url)} label="Favicon" size="sm" />
          </div>
        </div>

        {/* Card Settings */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Cài đặt thẻ
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Tiêu đề thẻ</label>
              <input type="text" value={settings.cardTitle || ''} onChange={e => update('cardTitle', e.target.value)} placeholder="VD: Guitar NOVA Member Card" className={inputCls('amber')} />
            </div>
            <ImageUploadField value={settings.cardLogo || ''} onChange={url => update('cardLogo', url)} label="Logo thẻ" focusColor="amber" />
            {(settings.cardTitle || settings.cardLogo) && (
              <div>
                <label className="block text-white/60 text-sm mb-2">Xem trước thẻ</label>
                <div className="relative w-full aspect-[1.6/1] max-w-xs rounded-xl overflow-hidden bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-400 p-4 flex flex-col justify-between shadow-lg">
                  {settings.cardLogo && <img src={settings.cardLogo} alt="Card Logo" className="w-12 h-12 object-contain" />}
                  <div>
                    <p className="text-white font-bold text-sm">{settings.cardTitle || 'Tiêu đề thẻ'}</p>
                    <p className="text-white/70 text-xs mt-1">{settings.siteName || 'Guitar NOVA'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Thông tin liên hệ
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Email</label>
              <input type="email" value={settings.email || ''} onChange={e => update('email', e.target.value)} className={inputCls('blue')} />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Số điện thoại</label>
              <input type="text" value={settings.phone || ''} onChange={e => update('phone', e.target.value)} className={inputCls('blue')} />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Địa chỉ</label>
              <textarea value={settings.address || ''} onChange={e => update('address', e.target.value)} className={`${inputCls('blue')} resize-none`} rows={3} />
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
                <input type="url" value={settings[key] || ''} onChange={e => update(key, e.target.value)} placeholder={placeholder} className={inputCls('pink')} />
              </div>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            SEO Settings
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Meta Title</label>
              <input type="text" value={settings.metaTitle || ''} onChange={e => update('metaTitle', e.target.value)} className={inputCls('green')} />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Meta Keywords</label>
              <input type="text" value={settings.metaKeywords || ''} onChange={e => update('metaKeywords', e.target.value)} placeholder="guitar, music, instruments..." className={inputCls('green')} />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-white/60 text-sm mb-2">Meta Description</label>
              <textarea value={settings.metaDescription || ''} onChange={e => update('metaDescription', e.target.value)} className={`${inputCls('green')} resize-none`} rows={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
