import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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

  // Dynamically update favicon via DOM (Helmet doesn't handle favicons well)
  useEffect(() => {
    if (settings?.favicon) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.type = 'image/png';
      link.href = settings.favicon;
    }
  }, [settings]);

  const siteName = settings?.siteName || 'Guitar NOVA';
  const metaTitle = settings?.metaTitle || siteName;
  const metaDescription = settings?.metaDescription || 'Cửa hàng đàn guitar chính hãng uy tín nhất. Cung cấp các dòng đàn guitar acoustic, classic, electric với giá tốt nhất thị trường.';
  const metaKeywords = settings?.metaKeywords || 'guitar, đàn guitar, guitar acoustic, guitar classic, guitar electric, mua guitar, Guitar NOVA';

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:site_name" content={siteName} />
        {settings?.favicon && <meta property="og:image" content={settings.favicon} />}
        <meta property="twitter:title" content={metaTitle} />
        <meta property="twitter:description" content={metaDescription} />
        {settings?.favicon && <meta property="twitter:image" content={settings.favicon} />}
      </Helmet>
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
    </>
  );
}