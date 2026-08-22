import React from 'react';
import { Award, CheckCircle2, Crown, Sparkles, X, ShieldCheck, Zap, ChevronRight, Gift } from 'lucide-react';
import { TIERS, getAllyTier, formatPoints } from '../../utils/helpers';
import { User } from '../../types';

interface TierScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
}

export const TierScaleModal: React.FC<TierScaleModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  if (!isOpen) return null;

  const totalEarned = currentUser?.totalPointsEarned || 0;
  const tierInfo = getAllyTier(totalEarned);
  const totalSoats = Math.floor(totalEarned / 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Programa de Fidelización
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            Escalas de Fidelidad Superpuntos
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg leading-relaxed">
            Acumula 5 puntos por cada SOAT validado. Alcanza de <strong className="text-cyan-400">25 a 30 SOATs</strong> para convertirte en <strong className="text-cyan-300 font-extrabold">Diamante</strong>, la escala máxima del programa.
          </p>

          {/* Current Ally Status Bar */}
          {currentUser && currentUser.role === 'ally' && (
            <div className="mt-4 bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Tu Nivel Actual:</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${tierInfo.current.badgeBg}`}>
                      {tierInfo.current.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    <strong>{totalSoats} SOATs validados</strong> ({formatPoints(totalEarned)} pts acumulados)
                  </p>
                </div>
              </div>

              {tierInfo.current.name !== 'Diamante' ? (
                <div className="text-right">
                  <span className="text-[11px] text-cyan-300 font-bold block">
                    Faltan {tierInfo.soatsToDiamond} SOATs para Diamante
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Máxima escala ({25 - totalSoats > 0 ? 25 - totalSoats : 0} a 30 SOATs)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
                  <Crown className="w-4 h-4 text-cyan-400" />
                  <span>¡Máxima Escala Diamante Activa!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scales List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50">
          {TIERS.map((tier) => {
            const isCurrent = currentUser?.role === 'ally' && tierInfo.current.name === tier.name;
            const isDiamond = tier.name === 'Diamante';

            return (
              <div
                key={tier.name}
                className={`rounded-2xl p-4 sm:p-5 transition-all border ${
                  isCurrent
                    ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20'
                    : isDiamond
                    ? 'bg-gradient-to-br from-cyan-50/70 to-blue-50/40 border-cyan-300 shadow-xs'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs font-bold text-sm"
                      style={{ backgroundColor: tier.iconColor }}
                    >
                      {isDiamond ? <Crown className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900">
                          {tier.name}
                        </h3>
                        {isDiamond && (
                          <span className="text-[10px] font-black bg-cyan-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Máxima Escala
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] font-black bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Tu Nivel
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {tier.description}
                      </p>
                    </div>
                  </div>

                  {/* Target pill */}
                  <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-right sm:self-center shrink-0 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                      Requisito
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-800">
                      {tier.minSoats === 25 ? '25 a 30 SOATs' : `${tier.minSoats} a ${tier.maxSoats} SOATs`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono ml-1">
                      ({tier.minPoints}{tier.maxPoints < 99999 ? ` - ${tier.maxPoints}` : '+'} pts)
                    </span>
                  </div>
                </div>

                {/* Benefits checklist */}
                <div className="pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Beneficios Exclusivos
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Cada SOAT aprobado en RUNT acredita <strong className="text-amber-600">5 Superpuntos</strong>.
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
