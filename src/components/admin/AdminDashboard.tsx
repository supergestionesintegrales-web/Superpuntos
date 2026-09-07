import React from 'react';
import { 
  Layers, 
  CheckSquare, 
  Package, 
  Users, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Plus, 
  CheckCircle2,
  Gift,
  Award,
  Database,
  RefreshCw,
  RotateCcw,
  Trash2,
  X
} from 'lucide-react';
import { CoinIcon } from '../common/CoinIcon';
import { useApp } from '../../context/AppContext';
import { formatPoints, formatDate } from '../../utils/helpers';
import { CampaignIcon } from '../common/CampaignIcon';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenNewProductModal: () => void;
  onOpenNewCampaignModal: () => void;
  onOpenManualPointsModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  setActiveTab,
  onOpenNewProductModal,
  onOpenNewCampaignModal,
  onOpenManualPointsModal,
}) => {
  const { 
    users, 
    products, 
    gestiones, 
    orders, 
    campaigns, 
    transactions,
    isGoogleConnected,
    sheetsSyncStatus,
    spreadsheetId,
    syncWithFirestore,
    isFirebaseConnected,
    firestoreStatus,
    resetAllDataToDefault
  } = useApp();

  const [isSyncingFirestore, setIsSyncingFirestore] = React.useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = React.useState<string | null>(null);

  const handleConfirmReset = async () => {
    setIsResetting(true);
    const safetyTimer = setTimeout(() => {
      setIsResetting(false);
      setIsResetConfirmOpen(false);
    }, 2500);

    try {
      await resetAllDataToDefault();
      clearTimeout(safetyTimer);
      setResetSuccessMessage('¡Sistema limpiado con éxito! Se eliminaron órdenes, notificaciones, movimientos y se reiniciaron saldos a 0.');
      setTimeout(() => {
        setResetSuccessMessage(null);
        setIsResetConfirmOpen(false);
      }, 1500);
    } catch (err) {
      clearTimeout(safetyTimer);
      console.warn('Aviso al reiniciar sistema:', err);
      setIsResetConfirmOpen(false);
    } finally {
      setIsResetting(false);
    }
  };

  const handleManualFirestoreSync = async () => {
    setIsSyncingFirestore(true);
    const safetyTimer = setTimeout(() => {
      setIsSyncingFirestore(false);
    }, 3000);

    try {
      await syncWithFirestore();
    } finally {
      clearTimeout(safetyTimer);
      setIsSyncingFirestore(false);
    }
  };

  const allies = users.filter(u => u.role === 'ally');
  const pendingGestiones = gestiones.filter(g => g.status === 'pending');
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const lowStockProducts = products.filter(p => p.stock < 5 && p.active);

  const totalCirculatingPoints = allies.reduce((sum, u) => sum + u.pointsBalance, 0);
  const totalEarnedHistorical = allies.reduce((sum, u) => sum + (u.totalPointsEarned || 0), 0);
  const totalRedeemedHistorical = allies.reduce((sum, u) => sum + (u.totalPointsRedeemed || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Admin Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-4 sm:p-6 lg:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              Panel de Control Gerencial & Fidelización
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Operaciones & Puntos <span className="text-blue-400">Superpuntos</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Monitorea el flujo de puntos, aprueba reportes comerciales de aliados en tiempo real y gestiona el inventario de premios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={handleManualFirestoreSync}
              disabled={isSyncingFirestore}
              title={firestoreStatus === 'connected' ? 'Firestore conectado y sincronizado' : firestoreStatus === 'connecting' ? 'Conectando con Firestore...' : 'Operando con almacenamiento local (Cloud Firestore pendiente de activación)'}
              className="px-3.5 py-2.5 rounded-lg font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
              <span>{isSyncingFirestore ? 'Sincronizando...' : 'Sincronizar Firestore'}</span>
              <span className={`w-2 h-2 rounded-full ${
                firestoreStatus === 'connected' 
                  ? 'bg-emerald-400' 
                  : firestoreStatus === 'connecting' 
                  ? 'bg-amber-400 animate-pulse' 
                  : 'bg-amber-500'
              }`}></span>
            </button>

            <button
              onClick={() => setActiveTab('admin_approvals')}
              className="px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-blue-800 hover:bg-blue-700 text-white shadow-lg shadow-blue-950/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4 stroke-[2.5]" />
              <span>Validar Gestiones ({pendingGestiones.length})</span>
            </button>

            <button
              onClick={onOpenManualPointsModal}
              className="px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CoinIcon className="w-4 h-4" />
              <span>Ajustar / Asignar Puntos</span>
            </button>

            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              title="Limpiar movimientos, puntos de prueba y canjes para distribución"
              className="px-3.5 py-2.5 rounded-lg font-bold text-xs bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Limpiar Datos de Prueba</span>
            </button>
          </div>
        </div>
      </div>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Circulating Points */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Puntos en Circulación
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <CoinIcon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatPoints(totalCirculatingPoints)} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PTS</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Saldo activo en billeteras de aliados
            </p>
          </div>
        </div>

        {/* KPI 2: Pending Approvals */}
        <div 
          onClick={() => setActiveTab('admin_approvals')}
          className={`rounded-2xl p-5 border shadow-xs space-y-3 cursor-pointer transition-all hover:border-blue-400 ${
            pendingGestiones.length > 0 
              ? 'bg-blue-50/60 border-blue-200' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Gestiones por Validar
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-950 flex items-center gap-2">
              {pendingGestiones.length}
              {pendingGestiones.length > 0 && (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded uppercase tracking-wider">
                  Revisar
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Reportes enviados por aliados
            </p>
          </div>
        </div>

        {/* KPI 3: Pending Deliveries */}
        <div 
          onClick={() => setActiveTab('admin_deliveries')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Canjes por Despachar
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {pendingOrders.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Premios físicos en logística
            </p>
          </div>
        </div>

        {/* KPI 4: Active Allies */}
        <div 
          onClick={() => setActiveTab('admin_allies')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Aliados Comerciales
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {allies.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Red nacional registrada
            </p>
          </div>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-4">
          Accesos Rápidos de Administración
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          <button
            onClick={() => setActiveTab('admin_approvals')}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-500/10 hover:border-blue-400 border border-slate-200 text-left transition-all group cursor-pointer"
          >
            <CheckSquare className="w-5 h-5 text-blue-900 group-hover:scale-110 transition-transform mb-2" />
            <p className="font-bold text-xs text-slate-900">Validar Reportes</p>
            <span className="text-[10px] text-slate-500">{pendingGestiones.length} pendientes</span>
          </button>

          <button
            onClick={onOpenNewProductModal}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group cursor-pointer"
          >
            <Package className="w-5 h-5 text-slate-700 group-hover:scale-110 transition-transform mb-2" />
            <p className="font-bold text-xs text-slate-900">+ Nuevo Premio</p>
            <span className="text-[10px] text-slate-500">Surte la tienda</span>
          </button>

          <button
            onClick={onOpenNewCampaignModal}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-slate-700 group-hover:scale-110 transition-transform mb-2" />
            <p className="font-bold text-xs text-slate-900">+ Nueva Campaña</p>
            <span className="text-[10px] text-slate-500">Reglas y servicios</span>
          </button>

          <button
            onClick={onOpenManualPointsModal}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-500/10 hover:border-blue-400 border border-slate-200 text-left transition-all group cursor-pointer"
          >
            <div className="mb-2">
              <CoinIcon className="w-5 h-5" />
            </div>
            <p className="font-bold text-xs text-slate-900">Ajustar Puntos</p>
            <span className="text-[10px] text-slate-500">Asignar o deducir</span>
          </button>

          <button
            onClick={() => setActiveTab('admin_inventory')}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group cursor-pointer"
          >
            <Gift className="w-5 h-5 text-slate-700 group-hover:scale-110 transition-transform mb-2" />
            <p className="font-bold text-xs text-slate-900">Inventario</p>
            <span className="text-[10px] text-slate-500">{products.length} productos</span>
          </button>

          <button
            onClick={() => setActiveTab('admin_deliveries')}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-slate-700 group-hover:scale-110 transition-transform mb-2" />
            <p className="font-bold text-xs text-slate-900">Exportar Datos</p>
            <span className="text-[10px] text-slate-500">Auditoría y canjes</span>
          </button>
        </div>
      </div>

      {/* Two Column Section: Urgent Approvals & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Pending Gestiones Spotlight */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-900" />
              <h3 className="font-bold text-sm text-slate-900">
                Gestiones Pendientes de Aprobación ({pendingGestiones.length})
              </h3>
            </div>

            <button
              onClick={() => setActiveTab('admin_approvals')}
              className="text-xs font-bold text-blue-900 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingGestiones.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <p className="font-bold text-slate-700">¡Al día! No hay reportes pendientes.</p>
              <p>Todos los movimientos comerciales han sido auditados.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {pendingGestiones.slice(0, 5).map(ges => (
                <div 
                  key={ges.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      <CampaignIcon name={ges.serviceType} className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">
                        {ges.allyName} <span className="font-normal text-slate-500">({ges.allyZone})</span>
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {ges.serviceType} • Ref: {ges.referenceNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-blue-900">
                      +{formatPoints(ges.pointsExpected)} pts
                    </span>
                    <button
                      onClick={() => setActiveTab('admin_approvals')}
                      className="px-2.5 py-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Revisar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Low Stock Alerts & System Summary */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Low Stock Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-900">
                  Stock Crítico en Tienda ({lowStockProducts.length})
                </h3>
              </div>

              <button
                onClick={() => setActiveTab('admin_inventory')}
                className="text-xs font-bold text-blue-900 hover:text-blue-800 cursor-pointer"
              >
                Inventario
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Todos los productos cuentan con inventario saludable.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="font-bold text-slate-900 truncate">{p.name}</span>
                    </div>
                    <span className="font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md shrink-0">
                      {p.stock} un.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Totals Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Balance Consolidado del Programa
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Total Puntos Emitidos:</span>
                <span className="font-bold text-emerald-400">+{formatPoints(totalEarnedHistorical)} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total Puntos Redimidos:</span>
                <span className="font-bold text-blue-300">-{formatPoints(totalRedeemedHistorical)} pts</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                <span>Puntos Vivos en Billeteras:</span>
                <span className="text-white">{formatPoints(totalCirculatingPoints)} pts</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modal for Resetting / Cleaning System */}
      {isResetConfirmOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => {
            setIsResetConfirmOpen(false);
            setIsResetting(false);
          }}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-white space-y-5 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsResetConfirmOpen(false);
                setIsResetting(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">
                  Limpiar Sistema para Distribución
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Esta acción restablecerá el sistema a su estado inicial de lanzamiento limpio:
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Se eliminan todas las órdenes de canje (pruebas de olla, bonos, etc.)</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Se eliminan todas las notificaciones pendientes e historial</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Se eliminan todos los movimientos y transacciones contables</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Se eliminan todas las gestiones comerciales de prueba</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Se restauran los stocks iniciales (Olla a presión a 20 un., etc.)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Se reinician los saldos de puntos a 0 para todos los usuarios</span>
              </div>
            </div>

            {resetSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  setIsResetting(false);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleConfirmReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Limpiando sistema...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmar y Limpiar Todo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
