import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';
import { AdminGuard } from './guards/AdminGuard';

// Layout Components
const MainLayout = React.lazy(() => import('../app/components/layouts/MainLayout').then(m => ({ default: m.MainLayout })));

// Lazy load pages for code splitting
const Home = React.lazy(() => import('../app/components/Home').then(m => ({ default: m.Home })));
const Products = React.lazy(() => import('../app/components/Products').then(m => ({ default: m.Products })));
const ProductDetail = React.lazy(() => import('../app/components/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Categories = React.lazy(() => import('../app/components/Categories').then(m => ({ default: m.Categories })));
const Promo = React.lazy(() => import('../app/components/Promo').then(m => ({ default: m.Promo })));
const Checkout = React.lazy(() => import('../app/components/Checkout').then(m => ({ default: m.Checkout })));
const Auth = React.lazy(() => import('../app/components/Auth').then(m => ({ default: m.Auth })));
const Account = React.lazy(() => import('../app/components/Account').then(m => ({ default: m.Account })));
const Rewards = React.lazy(() => import('../app/components/Rewards').then(m => ({ default: m.Rewards })));
const Events = React.lazy(() => import('../app/components/Events').then(m => ({ default: m.Events })));
const BlogList = React.lazy(() => import('../app/components/BlogList').then(m => ({ default: m.BlogList })));
const BlogDetail = React.lazy(() => import('../app/components/BlogDetail').then(m => ({ default: m.BlogDetail })));
const LandingPages = React.lazy(() => import('../app/components/LandingPages').then(m => ({ default: m.LandingPages })));
const LandingPageView = React.lazy(() => import('../app/components/LandingPageView').then(m => ({ default: m.LandingPageView })));
const OrderDetail = React.lazy(() => import('../app/components/OrderDetail').then(m => ({ default: m.OrderDetail })));
const AdminLogin = React.lazy(() => import('../app/components/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = React.lazy(() => import('../app/components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

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
                path: '/orders/:id',
                element: (
                    <AuthGuard>
                        <OrderDetail />
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
