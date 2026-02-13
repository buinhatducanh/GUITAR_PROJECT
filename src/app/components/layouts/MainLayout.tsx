import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Cart } from '../Cart';

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
