import React from 'react';
import { AppProvider } from './context/AppContext';
import { AppRouter } from '../router';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
      <Toaster
        position="top-right"
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