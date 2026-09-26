import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { TireFinderView } from './views/TireFinderView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { CustomerPanelView } from './views/CustomerPanelView';
import { AdminPanelView } from './views/AdminPanelView';
import { VehicleSelectorModal } from './components/VehicleSelectorModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Handle URL hash routing or direct navigation
  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sync hash with browser URL without reloading
    try {
      const hash = param ? `#${view}?${param}` : `#${view}`;
      window.history.pushState(null, '', hash);
    } catch (e) {
      // ignore in iframe
    }
  };

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const [v, p] = hash.split('?');
        setCurrentView(v || 'home');
        setViewParam(p);
      } else {
        setCurrentView('home');
        setViewParam(undefined);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('popstate', handleHashChange);
    return () => window.removeEventListener('popstate', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sticky Top Header & Mega Menu */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogView
            initialParam={viewParam}
            onNavigate={handleNavigate}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          />
        )}

        {currentView === 'tires' && (
          <TireFinderView
            initialParam={viewParam}
            onNavigate={handleNavigate}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          />
        )}

        {currentView === 'product' && (
          <ProductDetailView
            productId={viewParam || 'prod-brk-001'}
            onNavigate={handleNavigate}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            onNavigate={handleNavigate}
            onOrderCreated={(orderId) => handleNavigate('order-confirmation', orderId)}
          />
        )}

        {currentView === 'order-confirmation' && (
          <OrderConfirmationView
            orderId={viewParam || 'ord-10024'}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'panel-klienta' && (
          <CustomerPanelView
            initialSection={viewParam}
            onNavigate={handleNavigate}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          />
        )}

        {currentView === 'wishlist' && (
          <CustomerPanelView
            initialSection="wishlist"
            onNavigate={handleNavigate}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanelView onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Vehicle Selection Modal */}
      <VehicleSelectorModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onVehicleSelected={(veh) => {
          setIsVehicleModalOpen(false);
          // If on catalog, update view
          if (currentView === 'catalog') {
            handleNavigate('catalog', `vehicle=${veh.id}`);
          }
        }}
      />

      {/* User Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
