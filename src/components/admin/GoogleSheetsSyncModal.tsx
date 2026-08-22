import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Users, 
  Package, 
  CheckSquare, 
  Gift, 
  Clock, 
  CreditCard,
  LogOut,
  Sparkles,
  Link,
  ChevronRight,
  Database,
  Lock,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_SPREADSHEET_ID, SHEET_TABS } from '../../services/googleSheets';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({ isOpen, onClose }) => {
  const { 
    isGoogleConnected, 
    googleUserEmail, 
    connectGoogleSheets, 
    disconnectGoogleSheets, 
    syncToGoogleSheets, 
    calibrateSpreadsheet,
    sheetsSyncStatus,
    spreadsheetId,
    setSpreadsheetId,
    users,
    products,
    campaigns,
    gestiones,
    orders,
    accessLogs,
    transactions
  } = useApp();

  const [customSheetId, setCustomSheetId] = useState(spreadsheetId || DEFAULT_SPREADSHEET_ID);
  const [isEditingSheetId, setIsEditingSheetId] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const currentSheetId = spreadsheetId || DEFAULT_SPREADSHEET_ID;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${currentSheetId}/edit`;

  const handleCalibrate = async () => {
    if (!isGoogleConnected) {
      handleConnect();
      return;
    }
    setIsCalibrating(true);
    setSyncFeedback(null);
    try {
      const res = await calibrateSpreadsheet();
      if (res.success) {
        setSyncFeedback({
          type: 'success',
          message: '¡Estructura de Excel calibrada! Se verificaron y ajustaron las 7 pestañas con sus encabezados oficiales y fila superior fijada.'
        });
      } else {
        setSyncFeedback({
          type: 'error',
          message: res.message || 'Error calibrando encabezados en Excel'
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Error calibrando estructura de Excel'
      });
    } finally {
      setIsCalibrating(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setSyncFeedback(null);
    try {
      const ok = await connectGoogleSheets();
      if (ok) {
        setSyncFeedback({
          type: 'success',
          message: '¡Cuenta de Google conectada exitosamente con permisos de Sheets!'
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err.message || 'No se pudo conectar la cuenta de Google'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncNow = async () => {
    if (!isGoogleConnected) {
      handleConnect();
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncToGoogleSheets(customSheetId.trim());
      if (result.success) {
        setSyncFeedback({
          type: 'success',
          message: `¡Sincronización completada! Todos los registros fueron actualizados en las pestañas correspondientes de Google Sheets.`
        });
      } else {
        setSyncFeedback({
          type: 'error',
          message: result.message || 'Error durante la sincronización'
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Error al sincronizar con Google Sheets'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSheetId = () => {
    if (customSheetId.trim()) {
      setSpreadsheetId(customSheetId.trim());
      setIsEditingSheetId(false);
      setSyncFeedback({
        type: 'success',
        message: 'ID de Hoja de Cálculo actualizado.'
      });
    }
  };

  const articlesCount = products.filter(p => !p.isDigital && p.category !== 'Bonos').length;
  const bonusesCount = products.filter(p => p.isDigital || p.category === 'Bonos').length;

  const statsList = [
    { label: 'Usuarios y Aliados', count: users.length, tab: SHEET_TABS.USERS, icon: Users, color: 'text-blue-500 bg-blue-50' },
    { label: 'Artículos Físicos', count: articlesCount, tab: SHEET_TABS.ARTICLES, icon: Package, color: 'text-amber-500 bg-amber-50' },
    { label: 'Bonos de Dinero', count: bonusesCount, tab: SHEET_TABS.BONUSES, icon: Sparkles, color: 'text-orange-500 bg-orange-50' },
    { label: 'Promocionales y Campañas', count: (campaigns || []).length, tab: SHEET_TABS.PROMOTIONS, icon: Tag, color: 'text-rose-500 bg-rose-50' },
    { label: 'Gestiones y SOATs', count: gestiones.length, tab: SHEET_TABS.GESTIONES, icon: CheckSquare, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Canjes y Pedidos', count: orders.length, tab: SHEET_TABS.ORDERS, icon: Gift, color: 'text-purple-500 bg-purple-50' },
    { label: 'Historial de Accesos', count: accessLogs.length, tab: SHEET_TABS.ACCESS_LOGS, icon: Clock, color: 'text-indigo-500 bg-indigo-50' },
    { label: 'Libro de Puntos', count: transactions.length, tab: SHEET_TABS.TRANSACTIONS, icon: CreditCard, color: 'text-teal-500 bg-teal-50' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Google Workspace Integration
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Sincronización con Google Sheets
                </h2>
                <p className="text-xs text-slate-300">
                  Registro automático y bidireccional de datos del portal en tiempo real
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Connection Status Box */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isGoogleConnected 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isGoogleConnected ? 'bg-emerald-500 text-white shadow-sm' : 'bg-amber-500 text-white'
                }`}>
                  {isGoogleConnected ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isGoogleConnected ? 'Conexión Activa' : 'Autorización Requerida'}
                    </span>
                    {isGoogleConnected && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        OAuth 2.0 Verificado
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 text-slate-700 font-medium">
                    {isGoogleConnected 
                      ? `Conectado como: ${googleUserEmail || 'Usuario Google Autorizado'}`
                      : 'Inicia sesión con tu cuenta de Google para habilitar la escritura en la hoja.'
                    }
                  </p>
                </div>
              </div>

              <div>
                {isGoogleConnected ? (
                  <button
                    onClick={disconnectGoogleSheets}
                    className="text-xs font-bold text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Desconectar</span>
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="gsi-material-button bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>{isConnecting ? 'Conectando...' : 'Conectar con Google'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Toast */}
          {syncFeedback && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
              syncFeedback.type === 'success' 
                ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300' 
                : 'bg-red-100/80 text-red-900 border border-red-300'
            }`}>
              {syncFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{syncFeedback.message}</span>
            </div>
          )}

          {/* Target Spreadsheet Details */}
          <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-slate-500" />
                Hoja de Cálculo Destino
              </span>
              <a
                href={sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Abrir en Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {isEditingSheetId ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSheetId}
                  onChange={(e) => setCustomSheetId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                  placeholder="ID de la hoja de Google Sheets"
                />
                <button
                  onClick={handleSaveSheetId}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setIsEditingSheetId(false)}
                  className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-xs font-mono font-bold text-slate-800 truncate">
                    {currentSheetId}
                  </span>
                  {currentSheetId === DEFAULT_SPREADSHEET_ID && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                      Asignada
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsEditingSheetId(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold ml-2 shrink-0 cursor-pointer"
                >
                  Modificar
                </button>
              </div>
            )}
          </div>

          {/* Sync Structure Preview */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Estructura de Datos Sincronizados ({statsList.length} Pestañas)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {statsList.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          {stat.tab}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {stat.label}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                      {stat.count} reg.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Last sync info */}
          {sheetsSyncStatus.lastSyncAt && (
            <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-3">
              <span>Última sincronización completa:</span>
              <span className="font-bold text-slate-700">
                {new Date(sheetsSyncStatus.lastSyncAt).toLocaleString('es-CO')}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={sheetUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Hoja en Directo</span>
          </a>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCalibrate}
              disabled={isCalibrating || !isGoogleConnected}
              className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Crea pestañas faltantes, arregla encabezados y fija la fila 1"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isCalibrating ? 'animate-spin' : ''}`} />
              <span>{isCalibrating ? 'Calibrando...' : 'Ajustar Hojas y Encabezados'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Todo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
