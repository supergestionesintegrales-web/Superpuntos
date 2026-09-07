import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { CoinIcon } from '../common/CoinIcon';
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
  const [reason, setReason] = useState('Bono comercial por cumplimiento de metas.');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (preSelectedAllyId) {
      setSelectedAllyId(preSelectedAllyId);
    } else if (!selectedAllyId && allies.length > 0) {
      setSelectedAllyId(allies[0].id);
    }
  }, [preSelectedAllyId, allies, selectedAllyId]);

  if (!isOpen) return null;

  const currentSelectedAlly = allies.find(a => a.id === selectedAllyId) || allies[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedAllyId || currentSelectedAlly?.id;
    if (!targetId || pointsAmount <= 0 || isSubmitting) return;

    setIsSubmitting(true);
    const finalAmount = operationType === 'deduction' ? -Math.abs(pointsAmount) : Math.abs(pointsAmount);
    
    const typeLabel = operationType === 'bonus' 
      ? 'Bono Comercial' 
      : operationType === 'correction' 
      ? 'Ajuste Técnico' 
      : 'Deducción de Puntos';

    const fullDescription = `${typeLabel}: ${reason}`;

    try {
      adjustUserPoints(targetId, finalAmount, fullDescription, operationType === 'bonus');

      if (finalAmount > 0) {
        triggerConfetti();
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Error al ajustar puntos:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shadow-inner shrink-0">
              <CoinIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Operación Administrativa
              </span>
              <h2 className="text-lg sm:text-xl font-bold mt-0.5">Asignación Manual de Puntos</h2>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">¡Puntos Actualizados Exitosamente!</h3>
            <p className="text-xs text-slate-500">
              El saldo del aliado ha sido ajustado y la transacción quedó asentada en el libro contable.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            
            {/* Ally selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Seleccionar Aliado Destino *</label>
              <select
                value={selectedAllyId}
                onChange={(e) => setSelectedAllyId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700 bg-slate-50 font-medium"
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
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs">
                <span className="text-blue-900 font-medium">Saldo actual del aliado:</span>
                <span className="font-bold text-blue-900">{formatPoints(currentSelectedAlly.pointsBalance)} pts</span>
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
                    operationType === 'bonus' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <CoinIcon className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  required
                  min={1}
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-blue-900 focus:outline-hidden focus:border-blue-700"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700"
              />
            </div>

            {/* Projection Summary */}
            {currentSelectedAlly && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-500 font-medium">Nuevo saldo proyectado:</span>
                <span className={`font-black text-sm ${
                  operationType === 'deduction' ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {formatPoints(Math.max(0, currentSelectedAlly.pointsBalance + (operationType === 'deduction' ? -pointsAmount : pointsAmount)))} pts
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-950/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
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
