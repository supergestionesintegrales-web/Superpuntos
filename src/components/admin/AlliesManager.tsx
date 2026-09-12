import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  PlusCircle, 
  ArrowRight, 
  Store, 
  Sparkles,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  Crown,
  Info,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  X,
  Pencil,
  Clock,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { CoinIcon } from '../common/CoinIcon';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { formatPoints, getAllyTier, formatDate, generateAcronymicEmail } from '../../utils/helpers';
import { ManualPointsModal } from './ManualPointsModal';
import { TierScaleModal } from '../common/TierScaleModal';

interface AlliesManagerProps {
  onOpenManualPoints: (allyId?: string) => void;
  onOpenRegisterAlly?: () => void;
}

export const AlliesManager: React.FC<AlliesManagerProps> = ({ onOpenManualPoints, onOpenRegisterAlly }) => {
  const { 
    users, 
    switchUser, 
    currentUser, 
    deleteUser, 
    syncWithFirestore, 
    registerAlly, 
    updateUser,
    approveAndAddToFirebase 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'active'>('all');
  const [targetAllyForPoints, setTargetAllyForPoints] = useState<string | undefined>(undefined);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [selectedAllyForTier, setSelectedAllyForTier] = useState<User | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Approval state
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Editing Ally Business / Company
  const [editingAlly, setEditingAlly] = useState<User | null>(null);
  const [editingBusinessName, setEditingBusinessName] = useState('');
  const [editingZone, setEditingZone] = useState('');

  // Robust check for commercial allies - ONLY real registered users in Firebase
  const isAlly = (u: User): boolean => {
    // Exclude mock seed demo users
    if (u.id.startsWith('usr_ally_')) return false;

    const email = (u.email || '').toLowerCase().trim();
    const isAuthorizedAdmin = 
      email === 'supergestionesintegrales@gmail.com' ||
      email === 'supergestionesinetgrales@gmail.com' ||
      email === 'supergestionesintegrales' ||
      email === 'supergestionesinetgrales' ||
      email.includes('supergestiones') ||
      email === 'admin@superpuentos.online' ||
      email === 'admin@superpuntos.online' ||
      email === 'admin@superpuntos.supergestionesintegrales.online' ||
      u.id === 'usr_admin_owner' ||
      u.id === 'usr_admin_portal';

    if (isAuthorizedAdmin) return false;
    return true;
  };

  const allies = users.filter(isAlly);
  const pendingAllies = allies.filter(a => a.status === 'pending' || a.firebaseAuthAdded === false);
  const activeAllies = allies.filter(a => a.status !== 'pending' && a.firebaseAuthAdded !== false);

  const uniqueZones = Array.from(new Set(allies.map(a => a.zone).filter(Boolean))) as string[];

  const filteredAllies = allies.filter(ally => {
    if (filterTab === 'pending' && !(ally.status === 'pending' || ally.firebaseAuthAdded === false)) return false;
    if (filterTab === 'active' && (ally.status === 'pending' || ally.firebaseAuthAdded === false)) return false;
    if (selectedZone !== 'all' && (ally.zone || 'Principal') !== selectedZone) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ally.name.toLowerCase().includes(q);
      const matchDoc = ally.documentId.includes(q);
      const matchBiz = ally.businessName?.toLowerCase().includes(q) || false;
      const matchZone = ally.zone ? ally.zone.toLowerCase().includes(q) : false;
      const matchEmail = ally.email?.toLowerCase().includes(q) || false;
      const matchSystemEmail = ally.systemEmail?.toLowerCase().includes(q) || false;
      const matchPhone = ally.phone?.includes(q) || false;
      if (!matchName && !matchDoc && !matchBiz && !matchZone && !matchEmail && !matchSystemEmail && !matchPhone) return false;
    }
    return true;
  });

  const handleApproveToFirebase = async (ally: User) => {
    setApprovingId(ally.id);
    try {
      const res = await approveAndAddToFirebase(ally.id);
      if (res.success) {
        setSyncFeedback({
          type: 'success',
          message: `¡Aliado ${ally.name} agregado a la base de datos con éxito! Acceso habilitado con su correo institucional y contraseña.`
        });
      } else {
        setSyncFeedback({
          type: 'error',
          message: `No se pudo agregar a la base de datos: ${res.message}`
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: `Error al procesar alta en la base de datos: ${err?.message || 'Error inesperado'}`
      });
    } finally {
      setApprovingId(null);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const togglePasswordVisibility = (allyId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [allyId]: !prev[allyId]
    }));
  };

  const handleOpenPoints = (allyId: string) => {
    setTargetAllyForPoints(allyId);
    setIsPointsModalOpen(true);
  };

  const handleSyncFirebase = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const safetyTimer = setTimeout(() => {
      setIsSyncing(false);
    }, 3500);

    try {
      const res = await syncWithFirestore();
      clearTimeout(safetyTimer);
      if (res.success) {
        setSyncFeedback({
          type: 'success',
          message: `Sincronización completada con la base de datos. Se listan ${allies.length} aliados disponibles.`
        });
      } else {
        setSyncFeedback({
          type: 'info',
          message: `Nota de sincronización: ${res.message}`
        });
      }
    } catch (err: any) {
      clearTimeout(safetyTimer);
      setSyncFeedback({
        type: 'error',
        message: err?.message || 'Error al comunicarse con la base de datos.'
      });
    } finally {
      clearTimeout(safetyTimer);
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 8000);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Directorio y Fidelización de Aliados
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Red de Aliados Comerciales ({allies.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consulta los saldos, niveles de fidelidad y gestiona la red de aliados autorizados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncFirebase}
            disabled={isSyncing}
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sincronizar directamente con la base de datos"
          >
            <RefreshCw className={`w-4 h-4 text-blue-900 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Base de Datos'}</span>
          </button>

          <button
            onClick={() => {
              setSelectedAllyForTier(undefined);
              setIsTierModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ver requisitos de Bronce, Plata, Oro y Diamante (25-30 SOATs)"
          >
            <Award className="w-4 h-4 text-blue-900" />
            <span>Escalas de Fidelidad</span>
          </button>

          {onOpenRegisterAlly && (
            <button
              onClick={onOpenRegisterAlly}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>+ Registrar Aliado</span>
            </button>
          )}

          <button
            onClick={() => {
              setTargetAllyForPoints(undefined);
              setIsPointsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-900 hover:bg-blue-800 text-white shadow-md shadow-blue-950/25 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
          >
            <CoinIcon className="w-4 h-4" />
            <span>+ Asignar Puntos / Bono</span>
          </button>
        </div>
      </div>

      {/* Sync feedback banner */}
      {syncFeedback && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
          syncFeedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : syncFeedback.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-2">
            {syncFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : syncFeedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{syncFeedback.message}</span>
          </div>
          <button 
            onClick={() => setSyncFeedback(null)}
            className="text-slate-400 hover:text-slate-600 px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Toolbar */}
      <div className="space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Todos los Aliados</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {allies.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : pendingAllies.length > 0
                ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pendientes Base de Datos</span>
            {pendingAllies.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse ${
                filterTab === 'pending' ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'
              }`}>
                {pendingAllies.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('active')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'active'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Activos en Base de Datos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterTab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {activeAllies.length}
            </span>
          </button>
        </div>

        {/* Search & Zone Filter */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por aliado, cédula, correo o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700 bg-slate-50"
            />
          </div>

          {/* Zone Select Dropdown */}
          <div className="relative w-full sm:w-auto min-w-[220px]">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-blue-700 transition-all">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                aria-label="Filtrar por zona"
                className="w-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer py-1"
              >
                <option value="all">Todas las Zonas ({allies.length})</option>
                {uniqueZones.map(zone => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PENDING APPROVALS QUEUE BANNER ================= */}
      {pendingAllies.length > 0 && filterTab !== 'active' && (
        <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-white rounded-3xl p-6 border-2 border-amber-300 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 font-black">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-amber-950 flex items-center gap-2">
                  <span>Solicitudes de Aliados Pendientes de Agregar a la Base de Datos</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs">
                    {pendingAllies.length} pendiente{pendingAllies.length > 1 ? 's' : ''}
                  </span>
                </h3>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  Los siguientes usuarios completaron el registro. Su correo institucional acrónico y contraseña están listos para que los agregues a la base de datos y habilites su acceso al sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Pending allies cards list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAllies.map(ally => {
              const institutionalEmail = ally.systemEmail || generateAcronymicEmail(ally.name, ally.documentId, ally.businessName);
              const showPassword = visiblePasswords[ally.id] || false;
              const isApprovingThis = approvingId === ally.id;

              return (
                <div 
                  key={`pending-${ally.id}`}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-xs space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{ally.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                            Por Activar
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">C.C. {ally.documentId}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatDate(ally.createdAt)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 font-medium">Empresa / Aliado:</span>
                        <strong className="text-slate-900 font-bold truncate max-w-[180px]">{ally.businessName || 'No asignada'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 font-medium">Correo Personal:</span>
                        <span className="font-mono text-[11px] text-slate-600 truncate max-w-[180px]">{ally.email}</span>
                      </div>
                    </div>

                    {/* Generated Acronymic Institutional Email */}
                    <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-blue-900 tracking-wider">
                          Correo Institucional Acrónimo
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(institutionalEmail, `email-${ally.id}`)}
                          className="text-[11px] font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs"
                        >
                          {copiedField === `email-${ally.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="font-mono font-bold text-xs text-blue-950 break-all select-all">
                        {institutionalEmail}
                      </div>
                    </div>

                    {/* Password */}
                    <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Key className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-[11px] text-slate-600 font-medium shrink-0">Contraseña:</span>
                        <span className="font-mono font-bold text-xs text-slate-900 truncate">
                          {showPassword ? (ally.password || '******') : '••••••••••••'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(ally.id)}
                          className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
                          title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        {ally.password && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(ally.password || '', `pwd-${ally.id}`)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
                            title="Copiar contraseña"
                          >
                            {copiedField === `pwd-${ally.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Approve button */}
                  <button
                    type="button"
                    onClick={() => handleApproveToFirebase(ally)}
                    disabled={isApprovingThis}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isApprovingThis ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Agregando a la base de datos...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        <span>Agregar a la Base de Datos y Habilitar Acceso</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Allies Grid or Empty State */}
      {filteredAllies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAllies.map(ally => {
            const tier = getAllyTier(ally.totalPointsEarned || 0);
            const isPending = ally.status === 'pending' || ally.firebaseAuthAdded === false;
            const institutionalEmail = ally.systemEmail || generateAcronymicEmail(ally.name, ally.documentId, ally.businessName);
            const isApprovingThis = approvingId === ally.id;

            return (
              <div
                key={ally.id}
                className={`bg-white rounded-3xl p-6 border transition-all shadow-xs space-y-4 flex flex-col justify-between ${
                  isPending ? 'border-amber-300 ring-1 ring-amber-200/60' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Header card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={ally.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ally.name)}&background=002D72&color=fff&bold=true`}
                        alt={ally.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ally.name)}&background=002D72&color=fff&bold=true`;
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-heading font-extrabold text-sm text-slate-900">
                            {ally.name}
                          </h3>
                          {isPending ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> Pendiente Base de Datos
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Activo en Base de Datos
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                          <span>C.C. {ally.documentId}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-sans font-semibold border border-blue-100">
                            {ally.documentId.startsWith('G-') ? 'Google Auth' : 'Plataforma'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAllyForTier(ally);
                        setIsTierModalOpen(true);
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.current.badgeBg} hover:opacity-85 transition-opacity flex items-center gap-1 cursor-pointer`}
                      title="Ver escala de fidelidad de este aliado"
                    >
                      {tier.current.name === 'Diamante' ? <Crown className="w-3 h-3 text-cyan-500" /> : <Award className="w-3 h-3" />}
                      <span>{tier.current.name}</span>
                    </button>
                  </div>

                  {/* Business details */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-2 text-slate-600">
                    {/* Empresa / Aliado Highlight */}
                    <div className="flex items-center justify-between gap-2 p-2 bg-blue-50/80 rounded-xl border border-blue-200/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <Store className="w-4 h-4 text-blue-900 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[9px] text-blue-800 font-bold uppercase tracking-wider block">Empresa / Aliado</span>
                          <span className="font-extrabold text-xs text-slate-900 truncate block">
                            {ally.businessName || (
                              <span className="text-amber-600 font-normal italic">
                                Sin Empresa asignada
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAlly(ally);
                          setEditingBusinessName(ally.businessName || '');
                          setEditingZone(ally.zone || '');
                        }}
                        className="p-1 rounded-lg text-blue-900 hover:bg-blue-200/60 transition-colors shrink-0 cursor-pointer"
                        title="Editar o asignar Empresa / Aliado Comercial"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Acronymic System Email */}
                    <div className="p-2 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-1.5">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Correo Institucional</span>
                        <span className="font-mono text-[11px] font-bold text-blue-950 truncate block">
                          {institutionalEmail}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(institutionalEmail, `grid-email-${ally.id}`)}
                        className="p-1 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors shrink-0 cursor-pointer"
                        title="Copiar correo institucional"
                      >
                        {copiedField === `grid-email-${ally.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ally.zone || 'Principal'}</span>
                      </div>
                      {ally.phone && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{ally.phone}</span>
                        </div>
                      )}
                    </div>
                    {ally.email && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ally.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Pending Activation Action Banner if Pending */}
                  {isPending && (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                      <div className="text-[11px] text-amber-900 leading-tight">
                        <strong>Acceso no activado:</strong> Este usuario aún no ha sido agregado a la base de datos.
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApproveToFirebase(ally)}
                        disabled={isApprovingThis}
                        className="w-full py-2 px-3 rounded-xl font-black text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                      >
                        {isApprovingThis ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Agregando a la base de datos...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Agregar a la Base de Datos y Habilitar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Points overview cards */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70">
                      <span className="text-[10px] font-bold text-blue-900 uppercase block">Saldo Disponible</span>
                      <span className="text-base font-black text-blue-900 flex items-center gap-1.5">
                        <CoinIcon className="w-3.5 h-3.5" />
                        {formatPoints(ally.pointsBalance)} pts
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Histórico</span>
                      <span className="text-base font-black text-slate-800">
                        +{formatPoints(ally.totalPointsEarned || 0)} pts
                      </span>
                    </div>
                  </div>

                </div>

                {/* Action buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => switchUser(ally.id)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Entrar al portal simulando a este aliado"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                    <span>Simular Sesión</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setUserToDelete(ally)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar usuario del sistema y de la base de datos"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenPoints(ally.id)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-blue-900 hover:bg-blue-800 text-white flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      title="Asignar bonos, ajustes o deducciones a este aliado"
                    >
                      <CoinIcon className="w-3.5 h-3.5" />
                      <span>Ajustar Puntos</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center space-y-4 max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto border border-blue-200 shadow-inner">
            {allies.length === 0 ? <Store className="w-8 h-8" /> : <Search className="w-8 h-8 text-slate-400" />}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">
              {allies.length === 0 ? 'No hay aliados registrados en la red' : 'No se encontraron aliados'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {allies.length === 0 
                ? 'En la Red de Aliados solo figuran los usuarios registrados en la base de datos (formulario de registro o cuenta Google). Cada aliado debe contar con su empresa o punto comercial asignado.'
                : `No existen resultados que coincidan con la búsqueda "${searchQuery}" en la zona "${selectedZone}".`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {allies.length === 0 ? (
              <>
                {onOpenRegisterAlly && (
                  <button
                    onClick={onOpenRegisterAlly}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-900 hover:bg-blue-800 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Registrar Nuevo Aliado</span>
                  </button>
                )}
                <button
                  onClick={handleSyncFirebase}
                  disabled={isSyncing}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sincronizar Base de Datos</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedZone('all');
                }}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Limpiar Filtros de Búsqueda
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
          onClick={() => {
            setUserToDelete(null);
            setIsDeleting(false);
          }}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button in top-right */}
            <button
              type="button"
              onClick={() => {
                setUserToDelete(null);
                setIsDeleting(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                ¿Eliminar este usuario de la base de datos y del sistema?
              </h3>
              <p className="text-xs text-slate-500">
                Esta acción removerá el registro de usuario y su acceso permanentemente tanto del sistema local como de la base de datos.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Nombre:</span>
                <span className="font-bold text-slate-900">{userToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Cédula / Documento:</span>
                <span className="font-mono font-bold text-slate-800">{userToDelete.documentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Correo:</span>
                <span className="text-slate-800">{userToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Saldo de Puntos:</span>
                <span className="font-bold text-blue-900">{formatPoints(userToDelete.pointsBalance)} pts</span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setUserToDelete(null);
                  setIsDeleting(false);
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!userToDelete) return;
                  const ally = userToDelete;
                  setIsDeleting(true);
                  // Cerrar el modal de inmediato para no retener al usuario
                  setUserToDelete(null);
                  setIsDeleting(false);

                  // Ejecutar eliminación instantánea
                  try {
                    await deleteUser(ally.id);
                    setSyncFeedback({
                      type: 'success',
                      message: `Aliado "${ally.name}" eliminado correctamente del sistema y de la base de datos.`
                    });
                  } catch (err: any) {
                    setSyncFeedback({
                      type: 'info',
                      message: `Aliado "${ally.name}" retirado localmente.`
                    });
                  } finally {
                    setTimeout(() => setSyncFeedback(null), 6000);
                  }
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl font-black text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Eliminar de la Base de Datos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ally Business Modal */}
      {editingAlly && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setEditingAlly(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Editar Empresa / Aliado</h3>
                  <p className="text-[11px] text-slate-400">{editingAlly.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingAlly(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editingBusinessName.trim()) return;
              updateUser({
                ...editingAlly,
                businessName: editingBusinessName.trim(),
                zone: editingZone.trim() || editingAlly.zone || 'Principal'
              });
              setEditingAlly(null);
            }} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-blue-900" />
                  <span>Empresa o Aliado Comercial *</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: SuperGIROS La Estación, Droguería Central..."
                  value={editingBusinessName}
                  onChange={(e) => setEditingBusinessName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-blue-900 bg-slate-50"
                />
                <p className="text-[11px] text-slate-400">
                  Esta empresa identifica al usuario en la Red de Aliados Comerciales y en sus gestiones.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ciudad o Zona Operativa</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cali Centro, Palmira, Jamundí..."
                  value={editingZone}
                  onChange={(e) => setEditingZone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-blue-900 bg-slate-50"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAlly(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white cursor-pointer shadow-sm transition-all text-center"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Points Modal */}
      <ManualPointsModal
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
        preSelectedAllyId={targetAllyForPoints}
      />

      {/* Tier Scale Modal */}
      <TierScaleModal
        isOpen={isTierModalOpen}
        onClose={() => {
          setIsTierModalOpen(false);
          setSelectedAllyForTier(undefined);
        }}
        currentUser={selectedAllyForTier || (currentUser.role === 'ally' ? currentUser : undefined)}
      />

    </div>
  );
};
