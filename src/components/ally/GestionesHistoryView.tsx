import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  Sparkles, 
  Filter, 
  Calendar,
  AlertCircle,
  HelpCircle,
  Award,
  Crown
} from 'lucide-react';
import { CoinIcon } from '../common/CoinIcon';
import { useApp } from '../../context/AppContext';
import { ReportedGestion, GestionStatus, PointsTransaction } from '../../types';
import { formatPoints, formatDate, formatCurrency, getAllyTier } from '../../utils/helpers';
import { CampaignIcon } from '../common/CampaignIcon';
import { TierScaleModal } from '../common/TierScaleModal';

interface GestionesHistoryViewProps {
  onOpenReportModal: () => void;
}

export const GestionesHistoryView: React.FC<GestionesHistoryViewProps> = ({ onOpenReportModal }) => {
  const { gestiones, transactions, currentUser } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'gestiones' | 'transactions'>('gestiones');
  const [statusFilter, setStatusFilter] = useState<'all' | GestionStatus>('all');
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  // Filter only current ally's gestiones
  const allyGestiones = gestiones.filter(g => g.allyId === currentUser.id);
  const filteredGestiones = allyGestiones.filter(g => {
    if (statusFilter === 'all') return true;
    return g.status === statusFilter;
  });

  // Filter ally's transactions
  const allyTransactions = transactions.filter(t => t.allyId === currentUser.id);

  const pendingCount = allyGestiones.filter(g => g.status === 'pending').length;
  const approvedCount = allyGestiones.filter(g => g.status === 'approved').length;
  const rejectedCount = allyGestiones.filter(g => g.status === 'rejected').length;

  const tierInfo = getAllyTier(currentUser.totalPointsEarned || 0);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner with Stats - Minimized and clean */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Mis SOATs Registrados & Extracto
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Estado de validación de pólizas y movimiento de puntos.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl font-bold text-xs bg-blue-900 hover:bg-blue-800 text-white shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-blue-300" />
            <span>Registrar SOAT</span>
          </button>
        </div>

        {/* 3 Compact Metric Badges/Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          
          <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-200/80 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Saldo de Puntos
            </span>
            <span className="text-lg font-black text-blue-900">
              {formatPoints(currentUser.pointsBalance)} <span className="text-xs font-bold text-blue-700">pts</span>
            </span>
          </div>

          <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/80 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Ganados
            </span>
            <span className="text-lg font-black text-emerald-600">
              +{formatPoints(currentUser.totalPointsEarned || 0)} <span className="text-xs font-bold text-emerald-800">pts</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Canjeados
            </span>
            <span className="text-lg font-black text-slate-800">
              {formatPoints(currentUser.totalPointsRedeemed || 0)} <span className="text-xs font-bold text-slate-600">pts</span>
            </span>
          </div>

        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('gestiones')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'gestiones'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Pólizas SOAT Registradas</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeSubTab === 'gestiones' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {allyGestiones.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'transactions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CoinIcon className="w-4 h-4" />
          <span>Extracto de Movimientos</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeSubTab === 'transactions' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {allyTransactions.length}
          </span>
        </button>
      </div>

      {/* Sub-Tab 1: Gestiones */}
      {activeSubTab === 'gestiones' && (
        <div className="space-y-4">
          
          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todas ({allyGestiones.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pending' ? 'bg-blue-900 text-white' : 'bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendientes ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aprobadas ({approvedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-50 border border-red-200 text-red-800 hover:bg-red-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rechazadas ({rejectedCount})</span>
            </button>
          </div>

          {/* Gestiones List */}
          {filteredGestiones.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No hay gestiones en este estado</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Comercializa productos y reporta tus ventas para ver el progreso de validación aquí.
              </p>
              <button
                onClick={onOpenReportModal}
                className="px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 transition-colors cursor-pointer"
              >
                + Registrar SOAT
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGestiones.map(ges => {
                return (
                  <div
                    key={ges.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                          <CampaignIcon name={ges.serviceType} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{ges.serviceType}</h3>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {ges.referenceNumber}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Fecha reporte: {formatDate(ges.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-3 self-start sm:self-center">
                        {ges.status === 'pending' && (
                          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1 rounded-xl text-xs font-bold">
                            <Clock className="w-3.5 h-3.5 text-blue-700 animate-spin" />
                            <span>En Revisión Admin</span>
                          </div>
                        )}
                        {ges.status === 'approved' && (
                          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Aprobado (+{formatPoints(ges.pointsAwarded || ges.pointsExpected)} pts)</span>
                          </div>
                        )}
                        {ges.status === 'rejected' && (
                          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-800 px-3 py-1 rounded-xl text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Rechazado (0 pts)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Details & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {ges.licensePlate && (
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Placa Vehículo:</span>
                          <span className="font-mono font-black text-blue-950 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {ges.licensePlate}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">No. Póliza / Ref:</span>
                        <span className="font-mono font-bold text-slate-800 block mt-0.5">{ges.policyNumber || ges.referenceNumber}</span>
                      </div>
                      {ges.soatQuantity && (
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Cantidad:</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{ges.soatQuantity} SOAT(s)</span>
                        </div>
                      )}
                      {ges.insuranceCompany && (
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Aseguradora:</span>
                          <span className="font-semibold text-slate-700 block mt-0.5 truncate">{ges.insuranceCompany}</span>
                        </div>
                      )}
                      {ges.transactionValue && (
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Monto Transacción:</span>
                          <span className="font-semibold text-slate-700 block mt-0.5">{formatCurrency(ges.transactionValue)}</span>
                        </div>
                      )}
                      {ges.clientName && (
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Cliente Tomador:</span>
                          <span className="font-semibold text-slate-700 block mt-0.5">{ges.clientName} {ges.clientDocument ? `(${ges.clientDocument})` : ''}</span>
                        </div>
                      )}
                      {ges.notes && (
                        <div className="sm:col-span-2 lg:col-span-4 pt-1 border-t border-slate-200/60 mt-1">
                          <span className="text-slate-400 block text-[10px] font-bold">Detalles del reporte:</span>
                          <span className="text-slate-600 italic">{ges.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Feedback (If reviewed) */}
                    {ges.adminFeedback && (
                      <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                        ges.status === 'approved' 
                          ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-900' 
                          : 'bg-red-50/70 border border-red-200 text-red-900'
                      }`}>
                        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px] font-bold">Respuesta del Administrador:</strong>
                          <span>{ges.adminFeedback}</span>
                          {ges.reviewedAt && (
                            <span className="text-[10px] opacity-75 block mt-0.5">
                              Auditado el: {formatDate(ges.reviewedAt)} por {ges.reviewedBy || 'Admin'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Transactions Extract Ledger */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Movimientos Contables de Superpuntos
              </h3>
              <span className="text-xs text-slate-500">
                {allyTransactions.length} transacciones registradas
              </span>
            </div>

            {allyTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay movimientos registrados
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {allyTransactions.map(tx => {
                  const isPositive = tx.amount > 0;
                  return (
                    <div key={tx.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 text-xs">
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{tx.description}</p>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(tx.createdAt)} {tx.createdBy ? `• Por ${tx.createdBy}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-black text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isPositive ? `+${formatPoints(tx.amount)}` : formatPoints(tx.amount)} pts
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Saldo: {formatPoints(tx.newBalance)} pts
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tier Scale Modal */}
      <TierScaleModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        currentUser={currentUser}
      />

    </div>
  );
};
