import React, { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { AppRouter } from '../router';
import { Toaster } from 'sonner';
import { useSettingsStore } from '@/features/settings/store/settingsStore';

export default function App() {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const settings = useSettingsStore((state) => state.settings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    document.title = settings?.metaTitle || settings?.siteName || 'Guitar NOVA';
  }, [settings]);

  return (
    <AppProvider>
      <AppRouter />
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </AppProvider>
  );
}