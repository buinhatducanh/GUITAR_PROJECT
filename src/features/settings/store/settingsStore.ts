import { create } from 'zustand';
import { settingsApi } from '@/app/lib/api';

export interface SiteSettings {
    id: string;
    siteName: string;
    slogan?: string;
    logo?: string;
    favicon?: string;
    cardTitle?: string;
    cardLogo?: string;
    email?: string;
    phone?: string;
    address?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    tiktokUrl?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    businessHours?: string;
    paymentMethods: string[];
    shippingInfo?: string;
    createdAt: string;
    updatedAt: string;
}

interface SettingsState {
    settings: SiteSettings | null;
    isLoading: boolean;
    error: string | null;
}

interface SettingsActions {
    fetchSettings: () => Promise<void>;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>((set) => ({
    settings: null,
    isLoading: false,
    error: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await settingsApi.get();
            set({ settings: data, isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch settings:', error);
            set({
                error: error.message || 'Lỗi khi tải cài đặt website',
                isLoading: false,
                // Provide fallback settings so the app doesn't break
                settings: {
                    id: 'fallback',
                    siteName: 'Guitar NOVA',
                    paymentMethods: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            });
        }
    },
}));
