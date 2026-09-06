import React, { useState } from 'react';
import { 
  Package, 
  Coins, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Banknote, 
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
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-800" />
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
          <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
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
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-950 hover:bg-blue-900 text-white flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Gift className="w-4 h-4 text-blue-300" />
          <span>Explorar Catálogo</span>
        </button>
      </div>

      {/* Orders List */}
      {allyOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Aún no has realizado ningún canje</h3>
            <p className="text-xs text-slate-500">
              Acumula Superpuntos reportando tus ventas y visita el catálogo para reclamar freidoras, tecnología, bonos de dinero y más.
            </p>
          </div>
          <button
            onClick={onGoToCatalog}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-bold transition-all shadow-md shadow-blue-950/20 cursor-pointer"
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
                      Modalidad:{' '}
                      <strong className="text-slate-700">
                        {order.deliveryType === 'digital'
                          ? 'Bono Cargado a App SuperGIROS'
                          : order.deliveryType === 'shipping'
                          ? 'Envío Físico a Domicilio'
                          : order.deliveryType === 'branch_pickup'
                          ? 'Retiro en Oficina Principal SuperGIROS'
                          : 'Mixto (Despacho + Bono App SuperGIROS)'}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    
                    <button
                      onClick={() => setSelectedVoucherOrder(order)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-900" />
                      <span>Ver Comprobante</span>
                    </button>
                  </div>
                </div>

                {/* Items in order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item, idx) => {
                    const isBono = item.isDigital || item.category === 'Bonos';
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        {item.imageUrl ? (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-contain p-1 mix-blend-multiply"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs ${
                            isBono 
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                              : 'bg-blue-100 text-blue-900 border-blue-200'
                          }`}>
                            {isBono ? <Banknote className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.productName}</p>
                          <p className="text-[10px] text-slate-500">
                            {item.quantity} un. • {formatPoints(item.pointsCost)} pts c/u
                          </p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm inline-block mt-0.5 ${
                            isBono ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {isBono ? 'Bono App SuperGiros' : 'Artículo Despacho'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tracking / Delivery / App SuperGiros details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* App SuperGiros Bono */}
                    {(order.supergirosDocument || order.hasBonos || order.deliveryType === 'digital') && (
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-[11px]">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cargado a App SuperGiros (C.C. <strong>{order.supergirosDocument || order.allyDocument}</strong> • Cel <strong>{order.supergirosPhone || order.allyPhone}</strong>)</span>
                      </div>
                    )}

                    {/* Branch Pickup */}
                    {(order.pickupOffice || order.deliveryType === 'branch_pickup') && (
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 flex items-center gap-2 text-[11px]">
                        <Building className="w-3.5 h-3.5 text-blue-900" />
                        <span>Retiro: <strong>{order.pickupOffice || 'Oficina Principal SuperGIROS'}</strong></span>
                      </div>
                    )}

                    {/* Shipping Address / Courier */}
                    {order.shippingAddress && (
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-2 text-[11px]">
                        <Truck className="w-3.5 h-3.5 text-blue-900" />
                        <span>Despacho a: <strong>{order.shippingAddress}, {order.shippingCity}</strong></span>
                        {order.trackingNumber && (
                          <span className="font-mono font-bold text-blue-800">({order.courierName}: {order.trackingNumber})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Total Points */}
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 sm:ml-auto">
                    <span className="text-slate-500 font-normal">Puntos redimidos:</span>
                    <Coins className="w-4 h-4 text-blue-800" />
                    <span className="text-blue-900 font-black text-sm">{formatPoints(order.totalPoints)} pts</span>
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
