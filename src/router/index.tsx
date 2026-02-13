import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';

// Loading fallback component
const LoadingFallback = () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Đang tải...</p>
        </div>
    </div>
);

const router = createBrowserRouter(routes);

export const AppRouter = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <RouterProvider router={router} />
        </Suspense>
    );
};
