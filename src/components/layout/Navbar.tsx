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
  Trash2,
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
    markAllNotificationsAsRead,
    deleteNotification,
    clearNotifications,
    logout
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const pendingGestionesCount = gestiones.filter(g => g.status === 'pending').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

  const userNotifications = notifications.filter(n => 
    n.userId === currentUser.id || 
    n.userId === 'all' || 
    (currentUser.role === 'admin' && (n.userId === 'usr_admin' || !n.userId))
  );
  const unreadNotifications = userNotifications.filter(n => !n.read);
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
        return { title: 'Despachos & Auditoría', desc: 'Guías de transporte y consolidación contable' };
      default:
        return { title: 'Portal de Superpuntos', desc: 'Supergestiones Integrales' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <>
      {/* ================= DESKTOP SIDEBAR (Geometric Balance) ================= */}
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col border-r border-slate-800 fixed inset-y-0 left-0 z-30 select-none">
        
        {/* Brand Header */}
        <div className="p-7 flex flex-col items-center border-b border-slate-800 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-900/40 overflow-hidden border border-blue-600/40 bg-blue-950">
            <img src="/favicon.svg" alt="Superpuntos Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white font-bold text-xl tracking-tight leading-none">
            SUPER<span className="text-blue-400">PUNTOS</span>
          </h1>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1.5">
            Portal de Superpuntos
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
                        ? 'bg-blue-900/60 text-blue-300 border-l-2 border-blue-500 font-bold' 
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
                        ? 'bg-blue-900/60 text-blue-300 border-l-2 border-blue-500 font-bold' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
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
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-blue-400 transition-colors shadow-xs"
                />
                {currentUser.role === 'ally' && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-700 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                    ⚡
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-bold truncate group-hover:text-blue-300 transition-colors">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-slate-400 text-[10px] truncate font-mono">
                    {currentUser.role === 'admin' 
                      ? '🛡️ Super Admin' 
                      : (currentUser.businessName ? `🏪 ${currentUser.businessName}` : '👤 Aliado Comercial')}
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
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:via-blue-700 hover:to-indigo-900 text-white font-black px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-md shadow-blue-950/30 hover:shadow-lg hover:shadow-blue-900/40 border border-blue-700/60 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
                  title="Registrar SOAT para ganar 5 Superpuntos"
                >
                  {/* Subtle Shimmer Sheen */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shrink-0">
                    <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 stroke-[2.5] text-blue-200 group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                  <span className="tracking-tight whitespace-nowrap text-xs sm:text-sm">
                    <span className="hidden xs:inline">Registrar </span>SOAT
                  </span>
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
                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Por Validar
                </p>
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  <span className="text-base sm:text-xl font-black text-blue-900">
                    {pendingGestionesCount}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase hidden xs:inline">Gestiones</span>
                </div>
              </div>
            )}

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            {/* Ally: Cart Button */}
            {currentUser.role === 'ally' && (
              <button
                onClick={onOpenCart}
                className="relative p-2 sm:p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 shrink-0"
                title="Ver carrito de canjes"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-900 text-white font-extrabold text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin: Quick Shortcuts */}
            {currentUser.role === 'admin' && (
              <div className="flex items-center gap-1.5 sm:gap-2">

                <button
                  onClick={() => setActiveTab('admin_approvals')}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 sm:space-x-2 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <CheckSquare className="w-4 h-4 text-blue-300 shrink-0" />
                  <span className="hidden sm:inline">Validar SOATs</span>
                </button>
              </div>
            )}

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 sm:p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 relative shrink-0"
                title="Notificaciones"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-700 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-blue-900" />
                      <span className="font-bold text-sm text-slate-900">Notificaciones</span>
                      {unreadNotifications.length > 0 && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded-full">
                          {unreadNotifications.length} nuevas
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                          title="Marcar todas como leídas"
                        >
                          Marcar leídas
                        </button>
                      )}
                      {userNotifications.length > 0 && (
                        <button
                          onClick={() => clearNotifications(currentUser.id)}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md transition-colors"
                          title="Vaciar bandeja de notificaciones"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Vaciar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 px-2">
                    {userNotifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                        <Bell className="w-6 h-6 mx-auto text-slate-300 stroke-1" />
                        <p>No tienes notificaciones en tu bandeja</p>
                      </div>
                    ) : (
                      userNotifications.slice(0, 15).map(notif => (
                        <div 
                          key={notif.id}
                          className={`p-3 rounded-xl transition-colors relative group ${
                            notif.read ? 'hover:bg-slate-50 opacity-85' : 'bg-blue-50/70 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                markNotificationAsRead(notif.id);
                                if (notif.targetTab) setActiveTab(notif.targetTab);
                                setShowNotifications(false);
                              }}
                            >
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full bg-blue-700 shrink-0"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleDateString('es-CO', { 
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>

                            {/* Delete single notification */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer shrink-0"
                              title="Eliminar esta notificación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[8px] font-black">
                      ⚡
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-blue-400 font-medium">
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
                        isActive ? 'bg-blue-900/60 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
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
                        isActive ? 'bg-blue-900/60 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            )}

            {/* Mobile Actions: Wallet & Logout */}
            <div className="pt-2 mt-2 border-t border-slate-800 space-y-1.5">
              {currentUser.role === 'ally' && (
                <button
                  onClick={() => {
                    setIsWalletModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-blue-900/30 border border-blue-800/40 text-blue-200 text-xs font-bold hover:bg-blue-900/50 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Coins className="w-4 h-4 text-blue-400" />
                    <span>Mi Billetera & Nivel</span>
                  </div>
                  <span className="font-mono text-amber-400 font-black">{formatPoints(currentUser.pointsBalance)} pts</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>

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

