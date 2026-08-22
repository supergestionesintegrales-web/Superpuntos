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
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { formatPoints, getAllyTier, formatDate } from '../../utils/helpers';
import { ManualPointsModal } from './ManualPointsModal';
import { TierScaleModal } from '../common/TierScaleModal';

interface AlliesManagerProps {
  onOpenManualPoints: (allyId?: string) => void;
  onOpenRegisterAlly?: () => void;
}

export const AlliesManager: React.FC<AlliesManagerProps> = ({ onOpenManualPoints, onOpenRegisterAlly }) => {
  const { users, switchUser, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [targetAllyForPoints, setTargetAllyForPoints] = useState<string | undefined>(undefined);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [selectedAllyForTier, setSelectedAllyForTier] = useState<User | undefined>(undefined);

  const allies = users.filter(u => u.role === 'ally');

  const uniqueZones = Array.from(new Set(allies.map(a => a.zone).filter(Boolean))) as string[];

  const filteredAllies = allies.filter(ally => {
    if (selectedZone !== 'all' && (ally.zone || 'Principal') !== selectedZone) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ally.name.toLowerCase().includes(q);
      const matchDoc = ally.documentId.includes(q);
      const matchBiz = ally.businessName?.toLowerCase().includes(q) || false;
      const matchZone = ally.zone ? ally.zone.toLowerCase().includes(q) : false;
      if (!matchName && !matchDoc && !matchBiz && !matchZone) return false;
    }
    return true;
  });

  const handleOpenPoints = (allyId: string) => {
    setTargetAllyForPoints(allyId);
    setIsPointsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Directorio y Fidelización de Aliados
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Red de Aliados Comerciales
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consulta los saldos, niveles de fidelidad y gestiona la red de aliados autorizados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedAllyForTier(undefined);
              setIsTierModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ver requisitos de Bronce, Plata, Oro y Diamante (25-30 SOATs)"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Escalas de Fidelidad</span>
          </button>

          {onOpenRegisterAlly && (
            <button
              onClick={onOpenRegisterAlly}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>+ Registrar Aliado</span>
            </button>
          )}

          <button
            onClick={() => {
              setTargetAllyForPoints(undefined);
              setIsPointsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            <span>+ Asignar Puntos / Bono</span>
          </button>
        </div>
      </div>

      {/* Search & Zone Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por aliado, cédula, punto comercial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-slate-50"
          />
        </div>

        {/* Zone Select Dropdown */}
        <div className="relative w-full sm:w-auto min-w-[220px]">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-amber-500 transition-all">
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

      {/* Allies Grid */}
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
                      src={ally.avatarUrl}
                      alt={ally.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
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
                      <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{ally.businessName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ally.zone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ally.phone}</span>
                  </div>
                </div>

                {/* Points overview cards */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Saldo Disponible</span>
                    <span className="text-base font-black text-amber-600 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
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

                <button
                  onClick={() => handleOpenPoints(ally.id)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Asignar Puntos</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

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
