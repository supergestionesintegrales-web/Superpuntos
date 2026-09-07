import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Truck, 
  Package, 
  Clock, 
  CheckCircle2, 
  Download, 
  Search, 
  Printer, 
  Banknote, 
  Building, 
  X, 
  Edit3,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { CoinIcon } from '../common/CoinIcon';
import { useApp } from '../../context/AppContext';
import { RedemptionOrder, OrderStatus } from '../../types';
import { formatPoints, formatDate, exportOrdersToCSV } from '../../utils/helpers';
import { VoucherModal } from '../ally/VoucherModal';

const COURIER_PRESETS = ['Servientrega', 'Coordinadora', 'Envía', 'Interrapidísimo', 'TCC', 'Mensajería Propia'];

export const DeliveryAuditManager: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVoucherOrder, setSelectedVoucherOrder] = useState<RedemptionOrder | null>(null);

  // Dispatch modal state
  const [dispatchingOrder, setDispatchingOrder] = useState<RedemptionOrder | null>(null);
  const [courierName, setCourierName] = useState(COURIER_PRESETS[0]);
  const [trackingNumber, setTrackingNumber] = useState('');

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVoucher = o.voucherCode.toLowerCase().includes(q);
      const matchAlly = o.allyName.toLowerCase().includes(q);
      const matchDoc = o.allyDocument.includes(q);
      const matchCity = o.shippingCity?.toLowerCase().includes(q) || false;
      if (!matchVoucher && !matchAlly && !matchDoc && !matchCity) return false;
    }
    return true;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const shippedCount = orders.filter(o => o.status === 'shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  const handleExportCSV = () => {
    exportOrdersToCSV(orders);
  };

  const handleOpenDispatch = (order: RedemptionOrder) => {
    setDispatchingOrder(order);
    setCourierName(order.courierName || COURIER_PRESETS[0]);
    setTrackingNumber(order.trackingNumber || `GUIA-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchingOrder) return;

    updateOrderStatus(dispatchingOrder.id, 'shipped', trackingNumber, courierName);
    setDispatchingOrder(null);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Logística y Auditoría de Redenciones
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Despachos, Entregas y Reportes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Supervisa el despacho de premios a nivel nacional, asigna números de guía y descarga reportes contables.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar Reporte (.CSV)</span>
        </button>
      </div>

      {/* KPI metric strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">Total Canjes</span>
          <span className="text-xl font-black text-slate-900">{orders.length}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-900 block">Pendientes Despacho</span>
          <span className={`text-xl font-black ${pendingCount > 0 ? 'text-blue-900' : 'text-slate-900'}`}>
            {pendingCount + preparingCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 block">En Camino / Guía</span>
          <span className="text-xl font-black text-blue-600">{shippedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 block">Entregados con Éxito</span>
          <span className="text-xl font-black text-emerald-600">{deliveredCount}</span>
        </div>
      </div>

      {/* Filter and search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              statusFilter === 'pending' ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('preparing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              statusFilter === 'preparing' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            En Preparación ({preparingCount})
          </button>
          <button
            onClick={() => setStatusFilter('shipped')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              statusFilter === 'shipped' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            Despachados ({shippedCount})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              statusFilter === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Entregados ({deliveredCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código de voucher, aliado, cédula, ciudad de destino..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500 bg-slate-50"
          />
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Voucher & Fecha</th>
                <th className="p-4">Aliado Titular</th>
                <th className="p-4">Premios Solicitados</th>
                <th className="p-4">Puntos Redimidos</th>
                <th className="p-4">Modalidad & Destino</th>
                <th className="p-4 text-center">Estado Logístico</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => {
                return (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Voucher */}
                    <td className="p-4">
                      <span className="font-mono font-black text-slate-900 text-xs block">
                        {order.voucherCode}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    {/* Ally */}
                    <td className="p-4">
                      <strong className="font-bold text-slate-900 block">{order.allyName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">CC: {order.allyDocument}</span>
                      <span className="text-[10px] text-slate-400 block">{order.allyZone}</span>
                    </td>

                    {/* Items */}
                    <td className="p-4">
                      <div className="space-y-1">
                        {order.items.map((it, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">{it.quantity}x</span>
                            <span className="text-slate-600 truncate max-w-[150px]">{it.productName}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Points */}
                    <td className="p-4">
                      <div className="font-black text-blue-900 flex items-center gap-1.5">
                        <CoinIcon className="w-3.5 h-3.5" />
                        <span>{formatPoints(order.totalPoints)}</span>
                        <span className="text-[10px] text-slate-500">pts</span>
                      </div>
                    </td>

                    {/* Delivery Destination */}
                    <td className="p-4">
                      {order.deliveryType === 'digital' || order.hasBonos ? (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                            <Banknote className="w-3 h-3 text-emerald-600" />
                            Bono App SuperGiros
                          </span>
                          <div className="text-[10px] text-slate-600">
                            C.C: <strong>{order.supergirosDocument || order.allyDocument}</strong>
                            <br />
                            Cel: <strong>{order.supergirosPhone || order.allyPhone}</strong>
                            {order.supergirosName && (
                              <span className="block text-slate-500 truncate max-w-[160px]">{order.supergirosName}</span>
                            )}
                          </div>
                        </div>
                      ) : order.pickupOffice || order.deliveryType === 'branch_pickup' ? (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
                            <Building className="w-3 h-3 text-blue-900" />
                            Retiro en Oficina
                          </span>
                          <p className="text-[10px] text-slate-700 font-medium">
                            {order.pickupOffice || 'Oficina Principal SuperGIROS'}
                          </p>
                        </div>
                      ) : order.shippingAddress ? (
                        <div>
                          <p className="text-slate-800 font-medium truncate max-w-[180px]">{order.shippingAddress}</p>
                          <span className="text-[10px] text-slate-500">{order.shippingCity} • {order.recipientName}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Retiro en Oficina Principal SuperGIROS</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 text-center">
                      {order.status === 'delivered' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Entregado
                        </span>
                      )}
                      {order.status === 'shipped' && (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-blue-600" />
                            En Camino
                          </span>
                          {order.trackingNumber && (
                            <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                              {order.courierName}: {order.trackingNumber}
                            </span>
                          )}
                        </div>
                      )}
                      {order.status === 'preparing' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-700" />
                          En Preparación
                        </span>
                      )}
                      {order.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center gap-1">
                          Pendiente
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Status changers */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Preparar
                          </button>
                        )}

                        {(order.status === 'pending' || order.status === 'preparing') && (
                          <button
                            onClick={() => handleOpenDispatch(order)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Despachar</span>
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Entregado
                          </button>
                        )}

                        {/* Print Voucher */}
                        <button
                          onClick={() => setSelectedVoucherOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Ver e Imprimir Comprobante"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {dispatchingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Despacho Logístico
              </span>
              <h3 className="text-xl font-bold mt-1">Registrar Envío de Premio</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Voucher: <strong>{dispatchingOrder.voucherCode}</strong> ({dispatchingOrder.allyName})
              </p>
            </div>

            <form onSubmit={handleConfirmDispatch} className="p-4 sm:p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Empresa Transportadora *</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 bg-slate-50"
                >
                  {COURIER_PRESETS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Número de Guía de Envío *</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Destino:</span>
                <p>{dispatchingOrder.shippingAddress}, {dispatchingOrder.shippingCity}</p>
                <p className="text-[11px] text-slate-500">Receptor: {dispatchingOrder.recipientName} ({dispatchingOrder.recipientPhone})</p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDispatchingOrder(null)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                >
                  <Truck className="w-4 h-4" />
                  <span>Confirmar Despacho</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      <VoucherModal
        order={selectedVoucherOrder}
        isOpen={!!selectedVoucherOrder}
        onClose={() => setSelectedVoucherOrder(null)}
      />

    </div>
  );
};
