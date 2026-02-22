import React from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadApi } from '@/app/lib/api';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  folder?: string;
  size?: 'sm' | 'md';
  focusColor?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value, onChange, label, folder = 'guitar-nova/settings', size = 'md', focusColor = 'purple',
}) => {
  const imgSize = size === 'sm' ? 'w-12 h-12' : 'w-20 h-20';
  const toastId = `upload-${label}`;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading(`Đang tải lên ${label}...`, { id: toastId });
      const url = await uploadApi.uploadToCloudinary(file, folder);
      onChange(url);
      toast.success(`Tải lên ${label} thành công`, { id: toastId });
    } catch {
      toast.error(`Lỗi tải lên ${label}`, { id: toastId });
    }
  };

  return (
    <div>
      <label className="block text-white/60 text-sm mb-2">{label}</label>
      <div className="flex items-start gap-4">
        {value && (
          <div className={`relative ${imgSize} rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/5`}>
            <img src={value} alt={label} className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        )}
        <label className={`flex-1 flex flex-col items-center justify-center gap-2 px-4 ${size === 'sm' ? 'py-3' : 'py-4'} border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-${focusColor}-500/50 transition-colors`}>
          <Upload className={`${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'} text-white/40`} />
          <span className={`text-white/40 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{value ? `Thay đổi ${label.toLowerCase()}` : `Tải lên ${label.toLowerCase()}`}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>
    </div>
  );
};
