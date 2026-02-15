import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../organisms/Header';
import { Footer } from '../organisms/Footer';
import { Cart } from '../organisms/Cart';

export const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-black">
            <Header />
            <Outlet />
            <Footer />
            <Cart />
        </div>
    );
};
