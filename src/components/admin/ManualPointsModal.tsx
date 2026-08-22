import React, { useState } from 'react';
import { 
  Coins, 
  X, 
  Sparkles, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPoints } from '../../utils/helpers';

interface ManualPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedAllyId?: string;
}

export const ManualPointsModal: React.FC<ManualPointsModalProps> = ({
  isOpen,
  onClose,
  preSelectedAllyId
}) => {
  const { users, adjustUserPoints, triggerConfetti } = useApp();

  const allies = users.filter(u => u.role === 'ally');

  const [selectedAllyId, setSelectedAllyId] = useState(preSelectedAllyId || allies[0]?.id || '');
  const [operationType, setOperationType] = useState<'bonus' | 'correction' | 'deduction'>('bonus');
  const [pointsAmount, setPointsAmount] = useState<number>(500);
  const [reason, setReason] = useState('Bono especial por cumplimiento de metas del mes.');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentSelectedAlly = allies.find(a => a.id === selectedAllyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllyId || pointsAmount <= 0) return;

    const finalAmount = operationType === 'deduction' ? -Math.abs(pointsAmount) : Math.abs(pointsAmount);
    
    const typeLabel = operationType === 'bonus' 
      ? 'Bono Especial' 
      : operationType === 'correction' 
      ? 'Ajuste Contable' 
      : 'Deducción Manual';

    const fullDescription = `${typeLabel}: ${reason}`;

    adjustUserPoints(selectedAllyId, finalAmount, fullDescription);

    if (finalAmount > 0) {
      triggerConfetti();
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shadow-inner">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Operación Administrativa
              </span>
              <h2 className="text-xl font-bold mt-0.5">Asignación Manual de Puntos</h2>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">¡Puntos Actualizados Exitosamente!</h3>
            <p className="text-xs text-slate-500">
              El saldo del aliado ha sido ajustado y la transacción quedó asentada en el libro contable.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Ally selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Seleccionar Aliado Destino *</label>
              <select
                value={selectedAllyId}
                onChange={(e) => setSelectedAllyId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-slate-50 font-medium"
              >
                {allies.map(ally => (
                  <option key={ally.id} value={ally.id}>
                    {ally.name} - CC: {ally.documentId} ({ally.zone}) • Saldo: {formatPoints(ally.pointsBalance)} pts
                  </option>
                ))}
              </select>
            </div>

            {/* Current Balance Display */}
            {currentSelectedAlly && (
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                <span className="text-amber-900">Saldo actual del aliado:</span>
                <span className="font-bold text-amber-700">{formatPoints(currentSelectedAlly.pointsBalance)} pts</span>
              </div>
            )}

            {/* Operation Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tipo de Movimiento</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setOperationType('bonus')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    operationType === 'bonus' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  + Bono Comercial
                </button>

                <button
                  type="button"
                  onClick={() => setOperationType('correction')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    operationType === 'correction' ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ± Ajuste Técnico
                </button>

                <button
                  type="button"
                  onClick={() => setOperationType('deduction')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    operationType === 'deduction' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  - Deducción
                </button>
              </div>
            </div>

            {/* Points Amount Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Cantidad de Superpuntos *</label>
              <div className="relative">
                <Coins className="w-5 h-5 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min={1}
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-amber-600 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Justification / Audit Reason */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Motivo / Justificación de Auditoría *</label>
              <textarea
                rows={2}
                required
                placeholder="Indica el motivo de la asignación o ajuste de puntos..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Aplicar Movimiento</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
