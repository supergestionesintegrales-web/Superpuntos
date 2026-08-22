import React, { useState } from 'react';
import { useApp, AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { CatalogView } from './components/ally/CatalogView';
import { GestionesHistoryView } from './components/ally/GestionesHistoryView';
import { OrdersView } from './components/ally/OrdersView';
import { ReportGestionModal } from './components/ally/ReportGestionModal';
import { CartDrawer } from './components/ally/CartDrawer';
import { CheckoutModal } from './components/ally/CheckoutModal';
import { VoucherModal } from './components/ally/VoucherModal';

import { AdminDashboard } from './components/admin/AdminDashboard';
import { ApprovalsManager } from './components/admin/ApprovalsManager';
import { InventoryManager } from './components/admin/InventoryManager';
import { CampaignsManager } from './components/admin/CampaignsManager';
import { AlliesManager } from './components/admin/AlliesManager';
import { DeliveryAuditManager } from './components/admin/DeliveryAuditManager';
import { ManualPointsModal } from './components/admin/ManualPointsModal';

import { RegisterAllyModal } from './components/auth/RegisterAllyModal';
import { LoginSwitchModal } from './components/auth/LoginSwitchModal';
import { AuthPortal } from './components/auth/AuthPortal';
import { RedemptionOrder } from './types';
import { Coins, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

export function AppContent() {
  const { isAuthenticated, currentUser, currentRole, pendingGestionesCount } = useApp();

  const [activeTab, setActiveTab] = useState<string>(
    currentUser.role === 'admin' ? 'admin_dashboard' : 'catalog'
  );

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [justRedeemedOrder, setJustRedeemedOrder] = useState<RedemptionOrder | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginSwitchOpen, setIsLoginSwitchOpen] = useState(false);
  const [isManualPointsModalOpen, setIsManualPointsModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);

  // Synchronize default tab when role changes
  React.useEffect(() => {
    if (currentUser.role === 'admin') {
      if (!activeTab.startsWith('admin_')) {
        setActiveTab('admin_dashboard');
      }
    } else {
      if (activeTab.startsWith('admin_')) {
        setActiveTab('catalog');
      }
    }
  }, [currentUser.role]);

  const handleCheckoutSuccess = (order: RedemptionOrder) => {
    setJustRedeemedOrder(order);
  };

  // If not authenticated, display the dual-login AuthPortal
  if (!isAuthenticated) {
    return (
      <>
        <AuthPortal onOpenRegisterAlly={() => setIsRegisterModalOpen(true)} />
        
        <RegisterAllyModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={() => setActiveTab('catalog')}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col selection:bg-amber-500 selection:text-white font-sans">
      
      {/* Navigation (Sidebar on Desktop + Top Bar) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenProfileSwitcher={() => setIsLoginSwitchOpen(true)}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenReportGestionModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Content Area (Offset by sidebar on Desktop) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0 bg-slate-50">
        
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          
          {/* ALLY VIEWS */}
          {currentRole === 'ally' && (
            <>
              {activeTab === 'catalog' && (
                <CatalogView
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                  onOpenCart={() => setIsCartOpen(true)}
                />
              )}

              {activeTab === 'history' && (
                <GestionesHistoryView
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersView
                  onGoToCatalog={() => setActiveTab('catalog')}
                />
              )}
            </>
          )}

          {/* ADMIN VIEWS */}
          {currentRole === 'admin' && (
            <>
              {activeTab === 'admin_dashboard' && (
                <AdminDashboard
                  setActiveTab={setActiveTab}
                  onOpenNewProductModal={() => setIsNewProductModalOpen(true)}
                  onOpenNewCampaignModal={() => setIsNewCampaignModalOpen(true)}
                  onOpenManualPointsModal={() => setIsManualPointsModalOpen(true)}
                />
              )}

              {activeTab === 'admin_approvals' && (
                <ApprovalsManager />
              )}

              {activeTab === 'admin_inventory' && (
                <InventoryManager
                  isModalOpenExternal={isNewProductModalOpen}
                  onCloseExternalModal={() => setIsNewProductModalOpen(false)}
                />
              )}

              {activeTab === 'admin_campaigns' && (
                <CampaignsManager
                  isModalOpenExternal={isNewCampaignModalOpen}
                  onCloseExternalModal={() => setIsNewCampaignModalOpen(false)}
                />
              )}

              {activeTab === 'admin_allies' && (
                <AlliesManager
                  onOpenManualPoints={() => setIsManualPointsModalOpen(true)}
                  onOpenRegisterAlly={() => setIsRegisterModalOpen(true)}
                />
              )}

              {activeTab === 'admin_deliveries' && (
                <DeliveryAuditManager />
              )}
            </>
          )}

        </main>

        {/* Geometric Balance Footer */}
        <footer className="h-16 bg-slate-100 border-t border-slate-200 px-6 sm:px-10 flex flex-wrap items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-semibold text-slate-700">Sistema en Línea</span>
            </div>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline">Próximo Cierre de Campaña: <strong>30 de Noviembre</strong></span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-600 font-semibold">
              {currentUser.name} ({currentUser.role === 'admin' ? 'Administrador' : 'Aliado'})
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Soporte Operaciones: aliados@superpuntos.com</span>
          </div>
        </footer>

      </div>
      <ReportGestionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          if (activeTab === 'catalog') {
            // Can show a hint or leave on catalog
          }
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />

      <VoucherModal
        order={justRedeemedOrder}
        isOpen={!!justRedeemedOrder}
        onClose={() => setJustRedeemedOrder(null)}
      />

      <RegisterAllyModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => setActiveTab('catalog')}
      />

      <LoginSwitchModal
        isOpen={isLoginSwitchOpen}
        onClose={() => setIsLoginSwitchOpen(false)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
      />

      <ManualPointsModal
        isOpen={isManualPointsModalOpen}
        onClose={() => setIsManualPointsModalOpen(false)}
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
