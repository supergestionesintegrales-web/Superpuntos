import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Coins, 
  FileText, 
  User, 
  ExternalLink, 
  AlertCircle, 
  Sparkles, 
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportedGestion, GestionStatus } from '../../types';
import { formatPoints, formatDate, formatCurrency } from '../../utils/helpers';
import { CampaignIcon } from '../common/CampaignIcon';

const REJECTION_REASONS = [
  'El número de póliza / ticket ya fue reportado previamente (duplicado).',
  'El soporte o número de transacción no figura en la base de datos de la entidad.',
  'El ticket adjunto es ilegible o no contiene los datos obligatorios.',
  'La transacción no cumple con el monto mínimo requerido para la campaña.',
  'La fecha de la transacción está fuera de la vigencia de la campaña.',
  'Otro motivo particular (especificado en observaciones).'
];

export const ApprovalsManager: React.FC = () => {
  const { gestiones, approveGestion, rejectGestion, batchApprovePendingGestiones, triggerConfetti } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | GestionStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>('all');
  
  // Selection for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Approval Modal State
  const [approvingGestion, setApprovingGestion] = useState<ReportedGestion | null>(null);
  const [customAwardPoints, setCustomAwardPoints] = useState<number>(0);
  const [approvalComment, setApprovalComment] = useState('Gestión validada y aprobada exitosamente.');

  // Rejection Modal State
  const [rejectingGestion, setRejectingGestion] = useState<ReportedGestion | null>(null);
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [rejectionComment, setRejectionComment] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Campaigns list for filter
  const uniqueCampaigns = useMemo(() => {
    const set = new Set(gestiones.map(g => g.serviceType));
    return Array.from(set);
  }, [gestiones]);

  // Filtered gestiones
  const filteredGestiones = useMemo(() => {
    return gestiones.filter(g => {
      if (statusFilter !== 'all' && g.status !== statusFilter) return false;
      if (selectedCampaignFilter !== 'all' && g.serviceType !== selectedCampaignFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAlly = g.allyName.toLowerCase().includes(q);
        const matchesDoc = g.allyDocument.includes(q);
        const matchesRef = g.referenceNumber.toLowerCase().includes(q);
        const matchesClient = g.clientName?.toLowerCase().includes(q) || false;
        if (!matchesAlly && !matchesDoc && !matchesRef && !matchesClient) return false;
      }

      return true;
    });
  }, [gestiones, statusFilter, selectedCampaignFilter, searchQuery]);

  const pendingCount = gestiones.filter(g => g.status === 'pending').length;
  const approvedCount = gestiones.filter(g => g.status === 'approved').length;
  const rejectedCount = gestiones.filter(g => g.status === 'rejected').length;

  const handleOpenApproveModal = (gestion: ReportedGestion) => {
    setApprovingGestion(gestion);
    setCustomAwardPoints(gestion.pointsExpected);
    setApprovalComment('Gestión validada y aprobada exitosamente.');
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingGestion) return;

    approveGestion(approvingGestion.id, customAwardPoints, approvalComment);
    triggerConfetti();
    showToast(`¡Gestión de ${approvingGestion.allyName} aprobada! +${customAwardPoints} pts acreditados.`);
    setApprovingGestion(null);
  };

  const handleOpenRejectModal = (gestion: ReportedGestion) => {
    setRejectingGestion(gestion);
    setSelectedReason(REJECTION_REASONS[0]);
    setRejectionComment('');
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingGestion) return;

    const finalFeedback = rejectionComment.trim() 
      ? `${selectedReason} - ${rejectionComment.trim()}`
      : selectedReason;

    rejectGestion(rejectingGestion.id, finalFeedback);
    showToast(`Gestión ${rejectingGestion.referenceNumber} rechazada.`);
    setRejectingGestion(null);
  };

  const handleSelectAllPending = () => {
    const pendingIds = filteredGestiones.filter(g => g.status === 'pending').map(g => g.id);
    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    batchApprovePendingGestiones(selectedIds);
    triggerConfetti();
    showToast(`¡${selectedIds.length} gestiones aprobadas con éxito!`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Control de Auditoría Comercial
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Aprobación de Gestiones y Reportes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Valida los comprobantes comerciales de los aliados para inyectar automáticamente los Superpuntos correspondientes.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">
              {pendingCount} pendientes
            </span>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBatchApprove}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aprobar {selectedIds.length} Seleccionadas</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendientes ({pendingCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aprobadas ({approvedCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'rejected'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-900 border border-red-200 hover:bg-red-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rechazadas ({rejectedCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todas ({gestiones.length})
            </button>
          </div>

          {/* Quick Select All in Pending */}
          {statusFilter === 'pending' && filteredGestiones.length > 0 && (
            <button
              onClick={handleSelectAllPending}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              {selectedIds.length === filteredGestiones.length ? 'Deseleccionar todas' : 'Seleccionar todas las pendientes'}
            </button>
          )}
        </div>

        {/* Search input & Campaign selector */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre de aliado, cédula, póliza, referencia o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-slate-50"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <select
              value={selectedCampaignFilter}
              onChange={(e) => setSelectedCampaignFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Todas las Campañas / Servicios</option>
              {uniqueCampaigns.map(camp => (
                <option key={camp} value={camp}>{camp}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Gestiones List / Cards */}
      {filteredGestiones.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <CheckSquare className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No hay gestiones que coincidan con estos criterios</h4>
          <p className="text-xs text-slate-500">
            Cambia los filtros de estado o limpia la búsqueda para ver más reportes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGestiones.map(gestion => {
            const isSelected = selectedIds.includes(gestion.id);
            const isPending = gestion.status === 'pending';

            return (
              <div
                key={gestion.id}
                className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all shadow-xs space-y-4 ${
                  isPending 
                    ? 'border-amber-200 hover:border-amber-400 ring-1 ring-amber-400/10' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    
                    {/* Batch checkbox if pending */}
                    {isPending && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedIds(prev => 
                            isSelected ? prev.filter(id => id !== gestion.id) : [...prev, gestion.id]
                          );
                        }}
                        className="w-4 h-4 rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                    )}

                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <CampaignIcon name={gestion.serviceType} className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {gestion.allyName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          CC: {gestion.allyDocument}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {gestion.allyZone}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reportado: <strong>{formatDate(gestion.createdAt)}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Status and Points Badge */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center gap-1 text-sm font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>+{formatPoints(gestion.pointsAwarded || gestion.pointsExpected)}</span>
                      <span className="text-[10px] font-bold text-amber-800">pts</span>
                    </div>

                    {isPending ? (
                      <span className="text-xs font-bold bg-amber-500 text-white px-2.5 py-1 rounded-xl">
                        Pendiente
                      </span>
                    ) : gestion.status === 'approved' ? (
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Aprobado
                      </span>
                    ) : (
                      <span className="text-xs font-bold bg-red-100 text-red-800 border border-red-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        Rechazado
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Main Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Servicio / Campaña:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <strong className="text-slate-800 text-xs font-bold">{gestion.serviceType}</strong>
                      {gestion.soatQuantity && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                          {gestion.soatQuantity} SOAT{gestion.soatQuantity > 1 ? 's' : ''} (x5 pts)
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">
                      {gestion.licensePlate ? 'Placa & Póliza SOAT:' : 'No. Soporte / Póliza:'}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {gestion.licensePlate && (
                        <span className="font-mono font-black text-amber-950 bg-amber-200/70 border border-amber-300 px-2 py-0.5 rounded-md text-xs tracking-wider">
                          {gestion.licensePlate}
                        </span>
                      )}
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 inline-block">
                        {gestion.policyNumber || gestion.referenceNumber}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">
                      {gestion.insuranceCompany ? 'Aseguradora & Tipo:' : 'Monto Comercial:'}
                    </span>
                    {gestion.insuranceCompany ? (
                      <div className="mt-0.5">
                        <span className="font-bold text-slate-800 block truncate">{gestion.insuranceCompany}</span>
                        <span className="text-[10px] text-slate-500">{gestion.vehicleType || 'Particular'}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-700 block mt-0.5">
                        {gestion.transactionValue ? formatCurrency(gestion.transactionValue) : 'No especificado'}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Tomador / Cliente:</span>
                    <span className="font-semibold text-slate-700 block mt-0.5">
                      {gestion.clientName || 'Consumidor Final'} {gestion.clientDocument ? `(${gestion.clientDocument})` : ''}
                    </span>
                  </div>

                  {gestion.notes && (
                    <div className="sm:col-span-2 lg:col-span-4 pt-1 border-t border-slate-200/60 mt-1">
                      <span className="text-slate-400 text-[10px] block font-bold">Observación del Aliado:</span>
                      <p className="text-slate-600 italic">{gestion.notes}</p>
                    </div>
                  )}
                </div>

                {/* Feedback note if already audited */}
                {gestion.adminFeedback && (
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    gestion.status === 'approved' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
                  }`}>
                    <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[11px] font-bold">Dictamen del Administrador:</strong>
                      <span>{gestion.adminFeedback}</span>
                      <span className="text-[10px] opacity-75 block mt-0.5">
                        Auditado el {formatDate(gestion.reviewedAt || '')} por {gestion.reviewedBy || 'Admin'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions for Pending Gestiones */}
                {isPending && (
                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenRejectModal(gestion)}
                      className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Rechazar Reporte
                    </button>

                    <button
                      onClick={() => handleOpenApproveModal(gestion)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprobar e Inyectar Puntos</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {approvingGestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Validación Exitosa
              </span>
              <h3 className="text-xl font-bold mt-1">Aprobar Gestión Comercial</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Aliado: <strong>{approvingGestion.allyName}</strong> ({approvingGestion.serviceType})
              </p>
            </div>

            <form onSubmit={handleConfirmApproval} className="p-6 space-y-4">
              
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                {approvingGestion.licensePlate && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Placa Vehículo:</span>
                    <span className="font-mono font-black text-amber-950 bg-amber-200/70 border border-amber-300 px-2 py-0.5 rounded-md text-xs">
                      {approvingGestion.licensePlate}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Póliza / Referencia:</span>
                  <span className="font-mono font-bold text-slate-800">{approvingGestion.policyNumber || approvingGestion.referenceNumber}</span>
                </div>
                {approvingGestion.soatQuantity && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cantidad SOATs:</span>
                    <span className="font-bold text-emerald-700">{approvingGestion.soatQuantity} unidades (5 pts c/u)</span>
                  </div>
                )}
                {approvingGestion.insuranceCompany && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aseguradora:</span>
                    <span className="font-semibold text-slate-800">{approvingGestion.insuranceCompany}</span>
                  </div>
                )}
                {approvingGestion.transactionValue && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monto:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(approvingGestion.transactionValue)}</span>
                  </div>
                )}
              </div>

              {/* Points to award input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Superpuntos a Acreditar en Billetera *
                </label>
                <div className="relative">
                  <Coins className="w-5 h-5 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    required
                    min={1}
                    value={customAwardPoints}
                    onChange={(e) => setCustomAwardPoints(parseInt(e.target.value) || 0)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-amber-600 focus:outline-hidden focus:border-emerald-500 bg-amber-50/40"
                  />
                </div>
                <span className="text-[10px] text-slate-500">
                  Puntaje esperado según campaña: {formatPoints(approvingGestion.pointsExpected)} pts
                </span>
              </div>

              {/* Comment / Audit note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Nota / Mensaje para el Aliado (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovingGestion(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar y Acreditar {formatPoints(customAwardPoints)} pts</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingGestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-700 to-rose-800 text-white p-6">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Rechazo de Gestión
              </span>
              <h3 className="text-xl font-bold mt-1">Rechazar Reporte Comercial</h3>
              <p className="text-xs text-red-100 mt-0.5">
                Aliado: <strong>{rejectingGestion.allyName}</strong> ({rejectingGestion.serviceType})
              </p>
            </div>

            <form onSubmit={handleConfirmRejection} className="p-6 space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Motivo Principal de Rechazo *
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-red-500 bg-slate-50"
                >
                  {REJECTION_REASONS.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Detalles Adicionales o Instrucciones de Corrección (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica al aliado cómo puede corregir o verificar su soporte..."
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                Al rechazar, el aliado no recibirá puntos y recibirá una notificación inmediata con el motivo para su conocimiento.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingGestion(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Rechazar y Notificar</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
