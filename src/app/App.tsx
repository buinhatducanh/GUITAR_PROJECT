import React, { useState, useEffect } from 'react';
import { AppProvider, useApp, Product, BlogPost, LandingPageData } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { Home } from './components/Home';
import { Products } from './components/Products';
import { ProductDetail } from './components/ProductDetail';
import { Checkout } from './components/Checkout';
import { Auth } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPages } from './components/LandingPages';
import { Rewards } from './components/Rewards';
import { Events } from './components/Events';
import { Account } from './components/Account';
import { Categories } from './components/Categories';
import { Promo } from './components/Promo';
import { AdminLogin } from './components/AdminLogin';
import { BlogList } from './components/BlogList';
import { BlogDetail } from './components/BlogDetail';
import { LandingPageView } from './components/LandingPageView';
import { Toaster } from 'sonner';

function AppContent() {
  const { currentPage, setCurrentPage, user, landingPages } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [landingPageSlug, setLandingPageSlug] = useState<string>('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleNavigate = (page: string) => {
    if (page.startsWith('/landing/')) {
      setLandingPageSlug(page);
      setCurrentPage('landing');
    } else {
      setCurrentPage(page);
      setLandingPageSlug('');
    }
    setSelectedProduct(null);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
  };

  const handleBuyNow = (product: Product) => {
    setCurrentPage('checkout');
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
  };

  const handleBackFromProductDetail = () => {
    setSelectedProduct(null);
    setCurrentPage('products');
  };

  const handleBackFromCheckout = () => {
    setCurrentPage('home');
  };

  const handleCheckoutSuccess = () => {
    setCurrentPage('home');
  };

  const handleBackFromAuth = () => {
    setCurrentPage('home');
  };

  const handleToggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
            onBuyNow={handleBuyNow}
          />
        );

      case 'products':
        return (
          <Products
            onBack={() => setCurrentPage('home')}
            onViewProduct={handleViewProduct}
            onBuyNow={handleBuyNow}
          />
        );

      case 'categories':
        return (
          <Categories
            onBack={() => setCurrentPage('home')}
            onViewProduct={handleViewProduct}
            onBuyNow={handleBuyNow}
          />
        );

      case 'promo':
        return (
          <Promo
            onBack={() => setCurrentPage('home')}
            onViewProduct={handleViewProduct}
            onBuyNow={handleBuyNow}
          />
        );

      case 'product-detail':
        return selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={handleBackFromProductDetail}
            onBuyNow={handleCheckout}
          />
        ) : (
          <Home
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
            onBuyNow={handleBuyNow}
          />
        );

      case 'checkout':
        return (
          <Checkout
            onBack={handleBackFromCheckout}
            onSuccess={handleCheckoutSuccess}
          />
        );

      case 'login':
        return (
          <Auth
            mode="login"
            onBack={handleBackFromAuth}
            onToggleMode={handleToggleAuthMode}
          />
        );

      case 'register':
        return (
          <Auth
            mode="register"
            onBack={handleBackFromAuth}
            onToggleMode={handleToggleAuthMode}
          />
        );

      case 'account':
        return (
          <Account 
            onBack={() => setCurrentPage('home')}
            onNavigate={handleNavigate}
          />
        );

      case 'admin':
        // Check if user is admin
        if (!user || user.role !== 'admin') {
          if (!showAdminLogin) {
            setShowAdminLogin(true);
          }
          return (
            <AdminLogin
              onBack={() => {
                setShowAdminLogin(false);
                setCurrentPage('home');
              }}
              onSuccess={() => {
                setShowAdminLogin(false);
              }}
            />
          );
        }
        return <AdminDashboard onBack={() => setCurrentPage('home')} />;

      case 'landing':
        return (
          <LandingPages
            page={landingPageSlug}
            onBack={() => setCurrentPage('home')}
            onNavigate={handleNavigate}
          />
        );

      case 'rewards':
        return <Rewards onBack={() => setCurrentPage('home')} />;

      case 'events':
        return <Events onBack={() => setCurrentPage('home')} />;

      case 'blog':
        if (selectedBlogPost) {
          return (
            <BlogDetail
              post={selectedBlogPost}
              onBack={() => setSelectedBlogPost(null)}
            />
          );
        }
        return (
          <BlogList
            onBack={() => setCurrentPage('home')}
            onSelectPost={(post) => setSelectedBlogPost(post)}
          />
        );

      default:
        return (
          <Home
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
            onBuyNow={handleBuyNow}
          />
        );
    }
  };

  const shouldShowHeader = currentPage !== 'admin';
  const shouldShowFooter = currentPage !== 'admin';

  return (
    <div className="min-h-screen bg-black">
      {shouldShowHeader && <Header onNavigate={handleNavigate} />}
      
      {renderPage()}
      
      {shouldShowFooter && (
        <Footer onNavigateAdmin={() => setCurrentPage('admin')} />
      )}
      
      <Cart onCheckout={handleCheckout} />
      
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
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}