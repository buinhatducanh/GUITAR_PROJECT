import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';
import { AdminGuard } from './guards/AdminGuard';

// ─── Templates (Layouts) ────────────────────────────────────
const MainLayout = React.lazy(() => import('../components/templates/MainLayout').then(m => ({ default: m.MainLayout })));

// ─── Pages (Atomic Design) ───────────────────────────────────
const Home = React.lazy(() => import('../components/pages/Home').then(m => ({ default: m.Home })));
const Products = React.lazy(() => import('../components/pages/Products').then(m => ({ default: m.Products })));
const ProductDetail = React.lazy(() => import('../components/pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Categories = React.lazy(() => import('../components/pages/Categories').then(m => ({ default: m.Categories })));
const Promo = React.lazy(() => import('../components/pages/Promo').then(m => ({ default: m.Promo })));
const Checkout = React.lazy(() => import('../components/pages/Checkout').then(m => ({ default: m.Checkout })));
const Auth = React.lazy(() => import('../components/pages/Auth').then(m => ({ default: m.Auth })));
const Account = React.lazy(() => import('../components/pages/Account').then(m => ({ default: m.Account })));
const Rewards = React.lazy(() => import('../components/pages/Rewards').then(m => ({ default: m.Rewards })));
const Events = React.lazy(() => import('../components/pages/Events').then(m => ({ default: m.Events })));
const BlogList = React.lazy(() => import('../components/pages/BlogList').then(m => ({ default: m.BlogList })));
const BlogDetail = React.lazy(() => import('../components/pages/BlogDetail').then(m => ({ default: m.BlogDetail })));
const LandingPages = React.lazy(() => import('../components/pages/LandingPages').then(m => ({ default: m.LandingPages })));
const LandingPageView = React.lazy(() => import('../components/pages/LandingPageView').then(m => ({ default: m.LandingPageView })));
const AdminLogin = React.lazy(() => import('../components/pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = React.lazy(() => import('../components/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

export const routes: RouteObject[] = [
    // Main layout routes (with Header/Footer)
    {
        element: <MainLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/products',
                element: <Products />,
            },
            {
                path: '/products/:slug',
                element: <ProductDetail />,
            },
            {
                path: '/categories',
                element: <Categories />,
            },
            {
                path: '/promo',
                element: <Promo />,
            },
            {
                path: '/checkout',
                element: (
                    <AuthGuard>
                        <Checkout />
                    </AuthGuard>
                ),
            },
            {
                path: '/login',
                element: <Auth mode="login" />,
            },
            {
                path: '/register',
                element: <Auth mode="register" />,
            },
            {
                path: '/account',
                element: (
                    <AuthGuard>
                        <Account />
                    </AuthGuard>
                ),
            },
            {
                path: '/rewards',
                element: <Rewards />,
            },
            {
                path: '/events',
                element: <Events />,
            },
            {
                path: '/blog',
                element: <BlogList />,
            },
            {
                path: '/blog/:slug',
                element: <BlogDetail />,
            },
            {
                path: '/landing',
                element: <LandingPages />,
            },
            {
                path: '/landing/:slug',
                element: <LandingPageView />,
            },
        ],
    },
    // Admin routes (no Header/Footer)
    {
        path: '/admin/login',
        element: <AdminLogin />,
    },
    {
        path: '/admin',
        element: (
            <AdminGuard>
                <AdminDashboard />
            </AdminGuard>
        ),
    },
];
