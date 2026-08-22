import React, { useState } from 'react';
import { 
  Package, 
  Coins, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Zap, 
  Building, 
  ExternalLink, 
  Gift, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RedemptionOrder } from '../../types';
import { formatPoints, formatDate } from '../../utils/helpers';
import { VoucherModal } from './VoucherModal';

interface OrdersViewProps {
  onGoToCatalog: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onGoToCatalog }) => {
  const { orders, currentUser } = useApp();

  const [selectedVoucherOrder, setSelectedVoucherOrder] = useState<RedemptionOrder | null>(null);

  // Filter ally orders
  const allyOrders = orders.filter(o => o.allyId === currentUser.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Entregado
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            En Camino / Despachado
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            En Preparación
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            Pendiente de Despacho
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Recompensas Reclamadas
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Mis Canjes & Vouchers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consulta el estado de entrega y reimprime tus comprobantes de canje en cualquier momento.
          </p>
        </div>

        <button
          onClick={onGoToCatalog}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Gift className="w-4 h-4 text-amber-400" />
          <span>Explorar Catálogo</span>
        </button>
      </div>

      {/* Orders List */}
      {allyOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Aún no has realizado ningún canje</h3>
            <p className="text-xs text-slate-500">
              Acumula Superpuntos reportando tus ventas y visita el catálogo para reclamar freidoras, tecnología, bonos de gasolina y más.
            </p>
          </div>
          <button
            onClick={onGoToCatalog}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Ir a la Tienda de Premios
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {allyOrders.map(order => {
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-slate-900">
                        {order.voucherCode}
                      </span>
                      <span className="text-xs text-slate-400">• {formatDate(order.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Modalidad: <strong className="text-slate-700">{order.deliveryType === 'digital' ? 'Bono Digital Instantáneo' : order.deliveryType === 'shipping' ? 'Envío Físico' : 'Retiro en Sede'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    
                    <button
                      onClick={() => setSelectedVoucherOrder(order)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ver Comprobante</span>
                    </button>
                  </div>
                </div>

                {/* Items in order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.productName}</p>
                        <p className="text-[10px] text-slate-500">
                          {item.quantity} un. • {formatPoints(item.pointsCost)} pts c/u
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking / Digital Voucher details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-2">
                  {order.digitalVoucherPin ? (
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      <span>PIN Digital: <strong className="font-mono font-bold">{order.digitalVoucherPin}</strong></span>
                    </div>
                  ) : order.trackingNumber ? (
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Guía de Envío: <strong className="font-bold">{order.trackingNumber}</strong> ({order.courierName || 'Transportadora'})</span>
                    </div>
                  ) : order.shippingAddress ? (
                    <div className="text-slate-600 text-xs">
                      📍 Destino: <strong>{order.shippingAddress}, {order.shippingCity}</strong>
                    </div>
                  ) : null}

                  {/* Total Points */}
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 sm:ml-auto">
                    <span className="text-slate-500 font-normal">Puntos redimidos:</span>
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-600 font-black text-sm">{formatPoints(order.totalPoints)} pts</span>
                  </div>
                </div>

              </div>
            );
          })}
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
