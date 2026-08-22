import React, { useState } from 'react';
import { 
  Sparkles, 
  Coins, 
  ShoppingCart, 
  Bell, 
  UserCheck, 
  ShieldAlert, 
  Menu, 
  X, 
  Gift, 
  FileText, 
  CheckSquare, 
  Package, 
  Layers, 
  Users, 
  FileSpreadsheet, 
  LogOut, 
  ChevronDown,
  PlusCircle,
  Award,
  ChevronRight,
  HelpCircle,
  Crown,
  User as UserIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPoints, getAllyTier } from '../../utils/helpers';
import { TierScaleModal } from '../common/TierScaleModal';
import { UserWalletModal } from '../ally/UserWalletModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCart: () => void;
  onOpenProfileSwitcher: () => void;
  onOpenRegisterModal: () => void;
  onOpenReportGestionModal: () => void;

}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCart,
  onOpenProfileSwitcher,
  onOpenRegisterModal,
  onOpenReportGestionModal,

}) => {
  const { 
    currentUser, 
    cart, 
    cartPointsTotal, 
    gestiones, 
    orders, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const pendingGestionesCount = gestiones.filter(g => g.status === 'pending').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const unreadNotifications = notifications.filter(n => !n.read);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const tierInfo = getAllyTier(currentUser.totalPointsEarned || 0);

  const allyNavItems = [
    { id: 'catalog', label: 'Catálogo de Premios', icon: Gift },
    { id: 'history', label: 'Mis SOATs Registrados', icon: FileText },
    { id: 'orders', label: 'Historial de Canjes', icon: Package }
  ];

  const adminNavItems = [
    { id: 'admin_dashboard', label: 'Panel General', icon: Layers },
    { 
      id: 'admin_approvals', 
      label: 'Validación de SOATs', 
      icon: CheckSquare, 
      badge: pendingGestionesCount 
    },
    { id: 'admin_inventory', label: 'Gestionar Inventario', icon: Package },
    { id: 'admin_campaigns', label: 'Campañas & Puntos', icon: Sparkles },
    { id: 'admin_allies', label: 'Red de Aliados', icon: Users },
    { 
      id: 'admin_deliveries', 
      label: 'Auditoría & Envíos', 
      icon: FileSpreadsheet, 
      badge: pendingOrdersCount 
    }
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'catalog':
        return { title: 'Catálogo Recompensas', desc: 'Canjea tus puntos acumulados por premios exclusivos' };
      case 'history':
        return { title: 'Mis SOATs & Extracto de Puntos', desc: 'Monitorea el estado de validación de tus pólizas de SOAT y puntos acumulados' };
      case 'orders':
        return { title: 'Mis Canjes & Vouchers', desc: 'Descarga tus comprobantes y sigue el estado de tus entregas' };
      case 'admin_dashboard':
        return { title: 'Panel de Control Gerencial', desc: 'Supervisión en tiempo real de la economía de Superpuntos' };
      case 'admin_approvals':
        return { title: 'Validación y Aprobación de SOATs', desc: 'Auditoría en RUNT y acreditación oficial de Superpuntos' };
      case 'admin_inventory':
        return { title: 'Inventario de Premios', desc: 'Control de existencias, productos y categorías' };
      case 'admin_campaigns':
        return { title: 'Reglas de Campañas Comerciales', desc: 'Configuración de factores y tasas de bonificación' };
      case 'admin_allies':
        return { title: 'Red de Aliados Comerciales', desc: 'Gestión de fidelización y bonificaciones manuales' };
      case 'admin_deliveries':
        return { title: 'Despachos & Auditoría Excel', desc: 'Guías de transporte y consolidación contable' };
      default:
        return { title: 'Portal de Canjes', desc: 'Supergestiones Integrales' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <>
      {/* ================= DESKTOP SIDEBAR (Geometric Balance) ================= */}
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col border-r border-slate-800 fixed inset-y-0 left-0 z-30 select-none">
        
        {/* Brand Header */}
        <div className="p-7 flex flex-col items-center border-b border-slate-800 text-center">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20 text-slate-900">
            <Coins className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-white font-bold text-xl tracking-tight leading-none">
            SUPER<span className="text-amber-500">PUNTOS</span>
          </h1>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1.5">
            Portal de Canjes
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          
          <div className="px-3 pb-2">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
              {currentUser.role === 'admin' ? 'Gestión Administrativa' : 'Canjes & Recompensas'}
            </p>
          </div>

          {/* ALLY NAVIGATION */}
          {currentUser.role === 'ally' && (
            <>
              {allyNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold transition-colors text-left cursor-pointer text-sm ${
                      isActive 
                        ? 'bg-amber-500/10 text-amber-500' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* ADMIN NAVIGATION */}
          {currentUser.role === 'admin' && (
            <>
              {adminNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold transition-colors text-left cursor-pointer text-sm ${
                      isActive 
                        ? 'bg-amber-500/10 text-amber-500' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        isActive ? 'bg-amber-500 text-slate-900' : 'bg-red-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}

        </nav>

        {/* User Card at bottom of sidebar (Interactive Wallet Dashboard Trigger) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center space-x-3 flex-1 min-w-0 mr-2 p-2 -m-1 rounded-xl hover:bg-slate-800/90 transition-all cursor-pointer group text-left border border-transparent hover:border-slate-700/80"
              title="Abrir Tablero de Billetera de Puntos y Nivel"
            >
              <div className="relative shrink-0">
                <img 
                  src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0f172a&color=fff&bold=true`} 
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-amber-400 transition-colors shadow-xs"
                />
                {currentUser.role === 'ally' && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-xs">
                    ⚡
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-bold truncate group-hover:text-amber-300 transition-colors">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-slate-400 text-[10px] truncate font-mono">
                    {currentUser.role === 'admin' ? '🛡️ Super Admin' : '👤 Aliado Comercial'}
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={useApp().logout}
              title="Cerrar sesión"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* ================= TOP HEADER (Geometric Balance Header) ================= */}
      <header className="lg:pl-64 sticky top-0 z-20 bg-white border-b border-slate-200">
        {/* Main Header Bar */}
        <div className="h-16 sm:h-20 flex items-center justify-between px-3 sm:px-8 lg:px-10 gap-2">
          
          {/* Mobile menu trigger + Page Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 lg:hidden hover:bg-slate-100 cursor-pointer shrink-0 border border-slate-200"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="min-w-0">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 tracking-tight leading-tight truncate">
                {pageInfo.title}
              </h2>
              <p className="text-slate-500 text-xs hidden md:block truncate">
                {pageInfo.desc}
              </p>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-5 shrink-0">
            
            {/* Ally: Registrar SOAT Button (Highlighted & Prominent) */}
            {currentUser.role === 'ally' && (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={onOpenReportGestionModal}
                  className="group relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 text-slate-950 font-black px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 border border-amber-200/80 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
                  title="Registrar SOAT para ganar 5 Superpuntos"
                >
                  {/* Subtle Shimmer Sheen */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-950/10 flex items-center justify-center group-hover:bg-slate-950/15 transition-colors">
                    <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 stroke-[2.5] text-slate-950 group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                  <span className="tracking-tight whitespace-nowrap">Registrar SOAT</span>
                </button>
              </div>
            )}

            {/* Admin Circulating Points Badge */}
            {currentUser.role === 'admin' && (
              <div 
                onClick={() => setActiveTab('admin_approvals')}
                className="flex flex-col items-end cursor-pointer group"
                title="Gestiones pendientes de validación"
              >
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Por Validar
                </p>
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg sm:text-xl font-black text-amber-500">
                    {pendingGestionesCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Gestiones</span>
                </div>
              </div>
            )}

            <div className="h-9 w-px bg-slate-200 hidden sm:block"></div>

            {/* Ally: Cart Button */}
            {currentUser.role === 'ally' && (
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                title="Ver carrito de canjes"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-900 font-extrabold text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin: Quick Shortcuts */}
            {currentUser.role === 'admin' && (
              <div className="flex items-center gap-2">

                <button
                  onClick={() => setActiveTab('admin_approvals')}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-xl shadow-slate-900/10 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span>Validar SOATs</span>
                </button>
              </div>
            )}

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 relative"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-sm text-slate-900">Notificaciones</span>
                      {unreadNotifications.length > 0 && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                          {unreadNotifications.length} nuevas
                        </span>
                      )}
                    </div>
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                      >
                        Marcar leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 px-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No tienes notificaciones
                      </div>
                    ) : (
                      notifications.slice(0, 8).map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.targetTab) setActiveTab(notif.targetTab);
                            setShowNotifications(false);
                          }}
                          className={`p-3 rounded-xl transition-colors cursor-pointer ${
                            notif.read ? 'hover:bg-slate-50 opacity-80' : 'bg-amber-50/50 hover:bg-amber-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleDateString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 text-white px-4 pt-3 pb-6 border-b border-slate-800 space-y-2">
            
            <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
              <button 
                onClick={() => {
                  setIsWalletModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2.5 text-left p-1 -m-1 rounded-lg hover:bg-slate-800/80 transition-colors w-full cursor-pointer"
              >
                <div className="relative shrink-0">
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    className="w-9 h-9 rounded-full object-cover border border-slate-700" 
                  />
                  {currentUser.role === 'ally' && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[8px] font-black">
                      ⚡
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-amber-400 font-medium">
                    {currentUser.role === 'admin' ? '🛡️ Super Admin' : '👤 Aliado • Ver Billetera'}
                  </p>
                </div>
              </button>
            </div>

            {currentUser.role === 'ally' && (
              <>
                {allyNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-semibold text-xs ${
                        isActive ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </>
            )}

            {currentUser.role === 'admin' && (
              <>
                {adminNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-xs ${
                        isActive ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-900">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            )}

          </div>
        )}

      </header>

      {/* Tier Scale Modal */}
      <TierScaleModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        currentUser={currentUser}
      />

      {/* User Wallet Dashboard Modal */}
      <UserWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onOpenReportModal={onOpenReportGestionModal}
        onNavigateTab={setActiveTab}
      />
    </>
  );
};

