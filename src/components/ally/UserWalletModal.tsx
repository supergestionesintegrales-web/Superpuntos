import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Award, 
  Crown, 
  Sparkles, 
  PlusCircle, 
  FileText, 
  ShoppingBag, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Store, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPoints, getAllyTier, TIERS } from '../../utils/helpers';
import { TierScaleModal } from '../common/TierScaleModal';

interface UserWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const UserWalletModal: React.FC<UserWalletModalProps> = ({
  isOpen,
  onClose,
  onOpenReportModal,
  onNavigateTab
}) => {
  const { currentUser, gestiones, orders, logout } = useApp();
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  if (!isOpen || !currentUser) return null;

  const isAlly = currentUser.role === 'ally';
  const tierInfo = getAllyTier(currentUser.totalPointsEarned || 0);

  const allyGestiones = gestiones.filter(g => g.allyId === currentUser.id);
  const approvedSoats = allyGestiones.filter(g => g.status === 'approved').length;
  const pendingSoats = allyGestiones.filter(g => g.status === 'pending').length;
  const allyOrders = orders.filter(o => o.allyId === currentUser.id);

  return (
    <>
      <div 
        id="user-wallet-modal-backdrop"
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          id="user-wallet-modal-content"
          className="bg-slate-900 text-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-800 overflow-hidden relative my-6 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-b border-slate-800">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* User Identity Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0f172a&color=fff&bold=true`} 
                  alt={currentUser.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg shadow-amber-500/20"
                />
                <div className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-slate-950 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-sm">
                  {tierInfo.current.name === 'Diamante' ? '💎' : '⚡'}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {isAlly ? 'Aliado Comercial' : 'Administrador'}
                  </span>
                  {currentUser.documentId && (
                    <span className="text-[10px] font-mono text-slate-400">
                      CC: {currentUser.documentId}
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1 truncate">
                  {currentUser.name}
                </h2>

                {currentUser.businessName && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                    <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{currentUser.businessName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* TABLERO DE BILLETERA DE PUNTOS */}
            {isAlly && (
              <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 space-y-4 shadow-inner">
                
                {/* Board Top: Title & Level Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Coins className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Tu Billetera de Puntos
                    </span>
                  </div>

                  <button
                    onClick={() => setIsTierModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 transition-colors cursor-pointer text-left group"
                    title="Ver escala completa de niveles (Bronce, Plata, Oro, Diamante)"
                  >
                    <span className="text-[11px] text-slate-300">Nivel:</span>
                    <span className={`text-xs font-black flex items-center gap-1 ${
                      tierInfo.current.name === 'Diamante' ? 'text-cyan-400' : 'text-amber-400'
                    }`}>
                      {tierInfo.current.name === 'Diamante' ? <Crown className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
                      {tierInfo.current.name}
                    </span>
                    <span className="text-[10px] text-amber-400/80 group-hover:text-amber-300 underline ml-0.5">Escala</span>
                  </button>
                </div>

                {/* Main Points Number Display */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                      Puntos Disponibles para Canje
                    </span>
                    <div className="text-4xl sm:text-5xl font-black text-amber-500 tracking-tight flex items-baseline gap-2">
                      {formatPoints(currentUser.pointsBalance)}
                      <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">PTS</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Acumulado histórico: <strong className="text-white">{formatPoints(currentUser.totalPointsEarned || 0)} pts</strong> ({tierInfo.soatsEquivalent} SOATs)
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
                    <Coins className="w-8 h-8 stroke-[2.5]" />
                  </div>
                </div>

                {/* Tier Progress Bar */}
                <div className="space-y-1.5 pt-3 border-t border-slate-700/80">
                  {tierInfo.next ? (
                    <>
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Progreso a <strong>{tierInfo.next.name}</strong> ({tierInfo.soatsToNext} SOATs más)</span>
                        <span className="font-mono text-amber-400">{formatPoints(currentUser.totalPointsEarned || 0)} / {formatPoints(tierInfo.next.minPoints)} pts</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-700">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${tierInfo.progress}%` }}
                        />
                      </div>
                      {tierInfo.current.name !== 'Diamante' && (
                        <div className="text-[11px] text-cyan-400 flex items-center justify-between pt-0.5">
                          <span className="flex items-center gap-1">
                            <span>💎 Meta Diamante:</span>
                            <strong className="text-white">25 a 30 SOATs</strong>
                          </span>
                          <span className="font-semibold">{tierInfo.soatsToDiamond} SOATs restantes</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-cyan-300 py-1 font-bold">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-cyan-400" />
                        <span>¡Alcanzaste la máxima escala Diamante!</span>
                      </div>
                      <span className="text-[10px] bg-cyan-900/60 border border-cyan-500/40 px-2 py-0.5 rounded-full text-cyan-200">
                        25-30+ SOATs
                      </span>
                    </div>
                  )}
                </div>

                {/* Key Ally Counters */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-slate-900/80 rounded-xl p-3 text-center border border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Aprobados</p>
                    <p className="text-base sm:text-lg font-black text-emerald-400">{approvedSoats}</p>
                    <p className="text-[9px] text-slate-500">SOATs</p>
                  </div>
                  <div className="bg-slate-900/80 rounded-xl p-3 text-center border border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">En Validación</p>
                    <p className="text-base sm:text-lg font-black text-amber-400">{pendingSoats}</p>
                    <p className="text-[9px] text-slate-500">En RUNT</p>
                  </div>
                  <div className="bg-slate-900/80 rounded-xl p-3 text-center border border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Canjes</p>
                    <p className="text-base sm:text-lg font-black text-white">{allyOrders.length}</p>
                    <p className="text-[9px] text-slate-500">Realizados</p>
                  </div>
                </div>

              </div>
            )}

            {/* Quick Actions & Navigation */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-1">
                Acciones Rápidas
              </p>

              {isAlly && onOpenReportModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenReportModal();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                  <span>Registrar SOAT</span>
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {isAlly && onNavigateTab && (
                  <>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTab('history');
                      }}
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left flex items-center justify-between border border-slate-700 transition-colors cursor-pointer text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>Mis SOATs Registrados</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTab('orders');
                      }}
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left flex items-center justify-between border border-slate-700 transition-colors cursor-pointer text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>Mis Canjes & Vouchers</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* User Contact & Account Details */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{currentUser.phone}</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 font-bold text-xs flex items-center justify-center gap-2 border border-red-900/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>

          </div>
        </div>
      </div>

      {/* Tier Scale Full Modal */}
      <TierScaleModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        currentUser={currentUser}
      />
    </>
  );
};
