import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Coins, 
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
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { formatPoints, getAllyTier, formatDate } from '../../utils/helpers';
import { INITIAL_USERS } from '../../data/initialData';
import { ManualPointsModal } from './ManualPointsModal';
import { TierScaleModal } from '../common/TierScaleModal';

interface AlliesManagerProps {
  onOpenManualPoints: (allyId?: string) => void;
  onOpenRegisterAlly?: () => void;
}

export const AlliesManager: React.FC<AlliesManagerProps> = ({ onOpenManualPoints, onOpenRegisterAlly }) => {
  const { users, switchUser, currentUser, deleteUser, syncWithFirestore, registerAlly } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [targetAllyForPoints, setTargetAllyForPoints] = useState<string | undefined>(undefined);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [selectedAllyForTier, setSelectedAllyForTier] = useState<User | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Robust check for commercial allies
  const isAlly = (u: User): boolean => {
    if (u.role === 'ally') return true;
    if ((u.role as any) === 'aliado' || (u.role as any) === 'user' || (u.role as any) === 'comercial') return true;
    if (u.role !== 'admin') {
      const email = (u.email || '').toLowerCase();
      const isAdmin = email === 'supergestionesintegrales@gmail.com' ||
                      email === 'santiikstro1108@gmail.com' ||
                      email.includes('admin') ||
                      email.includes('supergestiones') ||
                      email.includes('operaciones') ||
                      email.includes('sistemas');
      return !isAdmin;
    }
    return false;
  };

  const allies = users.filter(isAlly);

  const uniqueZones = Array.from(new Set(allies.map(a => a.zone).filter(Boolean))) as string[];

  const filteredAllies = allies.filter(ally => {
    if (selectedZone !== 'all' && (ally.zone || 'Principal') !== selectedZone) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ally.name.toLowerCase().includes(q);
      const matchDoc = ally.documentId.includes(q);
      const matchBiz = ally.businessName?.toLowerCase().includes(q) || false;
      const matchZone = ally.zone ? ally.zone.toLowerCase().includes(q) : false;
      const matchEmail = ally.email?.toLowerCase().includes(q) || false;
      const matchPhone = ally.phone?.includes(q) || false;
      if (!matchName && !matchDoc && !matchBiz && !matchZone && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

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
          message: `Sincronización completada con Firebase. Se listan ${allies.length} aliados disponibles.`
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
        message: err?.message || 'Error al comunicarse con Firebase Firestore.'
      });
    } finally {
      clearTimeout(safetyTimer);
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 8000);
    }
  };

  const handleLoadBaseAllies = () => {
    const baseAllies = INITIAL_USERS.filter(u => u.role === 'ally');
    let loadedCount = 0;
    baseAllies.forEach(ba => {
      const exists = users.some(u => u.documentId === ba.documentId || u.id === ba.id);
      if (!exists) {
        registerAlly({
          name: ba.name,
          documentId: ba.documentId,
          email: ba.email,
          phone: ba.phone,
          password: ba.password,
          zone: ba.zone,
          businessName: ba.businessName,
          avatarUrl: ba.avatarUrl
        });
        loadedCount++;
      }
    });

    setSyncFeedback({
      type: 'success',
      message: loadedCount > 0 
        ? `Se agregaron ${loadedCount} aliados comerciales base con 0 puntos listos para operar.`
        : 'Todos los aliados comerciales base ya se encuentran registrados.'
    });
    setTimeout(() => setSyncFeedback(null), 6000);
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
            title="Sincronizar directamente con las colecciones de Firebase Firestore"
          >
            <RefreshCw className={`w-4 h-4 text-blue-900 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Firebase'}</span>
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
            <Coins className="w-4 h-4" />
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

      {/* Search & Zone Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por aliado, cédula, punto comercial..."
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

      {/* Allies Grid or Empty State */}
      {filteredAllies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAllies.map(ally => {
            const tier = getAllyTier(ally.totalPointsEarned || 0);

            return (
              <div
                key={ally.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-4 flex flex-col justify-between"
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
                        <h3 className="font-heading font-extrabold text-sm text-slate-900">
                          {ally.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                          <span>C.C. {ally.documentId}</span>
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
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1 text-slate-600">
                    {ally.businessName && (
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Store className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span className="truncate">{ally.businessName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ally.zone || 'Principal'}</span>
                    </div>
                    {ally.phone && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{ally.phone}</span>
                      </div>
                    )}
                    {ally.email && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ally.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Points overview cards */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70">
                      <span className="text-[10px] font-bold text-blue-900 uppercase block">Saldo Disponible</span>
                      <span className="text-base font-black text-blue-900 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-blue-900" />
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
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
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
                      title="Eliminar usuario del sistema y de Firebase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenPoints(ally.id)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-blue-900 hover:bg-blue-800 text-white flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      title="Asignar bonos, ajustes o deducciones a este aliado"
                    >
                      <Coins className="w-3.5 h-3.5" />
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
                ? 'La red comercial está lista para recibir registros o puedes cargar los aliados autorizados iniciales con saldo en 0 para iniciar la distribución.'
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
                  onClick={handleLoadBaseAllies}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>Cargar Red Base (0 pts)</span>
                </button>
                <button
                  onClick={handleSyncFirebase}
                  disabled={isSyncing}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sincronizar Firebase</span>
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
                ¿Eliminar este usuario de Firebase y del sistema?
              </h3>
              <p className="text-xs text-slate-500">
                Esta acción removerá el registro de usuario y su acceso permanentemente tanto del sistema local como de Firebase Firestore.
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

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setUserToDelete(null);
                  setIsDeleting(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
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
                      message: `Aliado "${ally.name}" eliminado correctamente del sistema y de Firebase.`
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
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Eliminar de Firebase</span>
                  </>
                )}
              </button>
            </div>
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
