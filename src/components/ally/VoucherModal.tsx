import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  QrCode, 
  Banknote, 
  Truck, 
  Building,
  ShieldCheck,
  Gift
} from 'lucide-react';
import { CoinIcon } from '../common/CoinIcon';
import { RedemptionOrder } from '../../types';
import { formatPoints, formatDate } from '../../utils/helpers';

interface VoucherModalProps {
  order: RedemptionOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
            <Sparkles className="w-4 h-4" />
            <span>Comprobante de Canje Generado</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir comprobante"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Section */}
        <div id="printable-voucher" className="p-4 sm:p-8 space-y-5 sm:space-y-6 bg-white">
          
          {/* Brand Header */}
          <div className="text-center pb-4 border-b border-slate-200 space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-900 text-white shadow-md mb-1">
              <CoinIcon className="w-8 h-8" />
            </div>
            <h1 className="font-heading font-black text-2xl tracking-tight text-slate-900">
              SUPER<span className="text-blue-900">PUNTOS</span>
            </h1>
            <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              Comprobante Oficial de Redención de Premios
            </p>
          </div>

          {/* Voucher Code Badge & Status */}
          <div className="bg-blue-50/80 rounded-2xl p-4 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900">
                Código de Comprobante / Voucher
              </span>
              <div className="font-mono text-2xl font-black text-slate-900 tracking-wider">
                {order.voucherCode}
              </div>
              <span className="text-[11px] text-slate-500">
                Fecha de Emisión: {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Canje Autorizado</span>
            </div>
          </div>

          {/* Digital Pin Highlight if Digital */}
          {order.digitalVoucherPin && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                PIN de Activación Inmediata:
              </span>
              <div className="font-mono text-xl font-black text-indigo-700 tracking-widest">
                {order.digitalVoucherPin}
              </div>
              <p className="text-[10px] text-indigo-600">
                Presenta este código o canjéalo directamente en la plataforma del aliado.
              </p>
            </div>
          )}

          {/* Ally Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Aliado Titular:</span>
              <strong className="text-slate-900 font-bold">{order.allyName}</strong>
              <p className="text-[11px] text-slate-600 mt-0.5">C.C. {order.allyDocument}</p>
            </div>

            <div>
              <span className="text-slate-500 block">Zona & Contacto:</span>
              <strong className="text-slate-900 font-bold">{order.allyZone}</strong>
              <p className="text-[11px] text-slate-600 mt-0.5">Tel: {order.allyPhone}</p>
            </div>
          </div>

          {/* Items Redeemed Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wide">
              Detalle de Recompensas Canjeadas:
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-contain p-0.5 mix-blend-multiply"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs ${
                        item.isDigital || item.category === 'Bonos'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-blue-100 text-blue-900 border-blue-200'
                      }`}>
                        {item.isDigital || item.category === 'Bonos' ? <Banknote className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <span className="text-[11px] text-slate-500">
                        Cantidad: {item.quantity} un.
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-bold text-blue-900">
                    {formatPoints(item.pointsCost * item.quantity)} pts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details - Physical Shipping */}
          {order.shippingAddress && (
            <div className="text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-900" />
                <span>Despacho de Artículos a Domicilio:</span>
              </span>
              <p className="text-slate-800 font-medium">
                {order.shippingAddress}, {order.shippingCity} ({order.shippingDepartment || 'Colombia'})
              </p>
              <p className="text-slate-500 text-[11px]">
                Receptor: <strong className="text-slate-700">{order.recipientName}</strong> • Tel: <strong className="text-slate-700">{order.recipientPhone}</strong>
              </p>
            </div>
          )}

          {/* Delivery Details - Pickup at Main Office SuperGIROS */}
          {(order.pickupOffice || order.deliveryType === 'branch_pickup') && (
            <div className="text-xs bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-1">
              <span className="font-bold text-blue-950 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-900" />
                <span>Retiro en Oficina Principal SuperGIROS:</span>
              </span>
              <p className="text-blue-950 font-medium">
                Sede: <strong>{order.pickupOffice || 'Oficina Principal SuperGIROS Regional'}</strong>
              </p>
              <p className="text-blue-900 text-[11px]">
                Autorizado para reclamar: <strong>{order.recipientName || order.allyName}</strong> • C.C. <strong>{order.pickupPersonDocument || order.allyDocument}</strong>
                {order.recipientPhone && (
                  <span> • Tel: <strong>{order.recipientPhone}</strong></span>
                )}
              </p>
            </div>
          )}

          {/* Delivery Details - Bonos de Dinero en App SuperGIROS */}
          {(order.supergirosDocument || order.hasBonos || order.deliveryType === 'digital' || order.items.some(i => i.isDigital || i.category === 'Bonos')) && (
            <div className="text-xs bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Bono Cargado Directamente a App SuperGIROS:</span>
              </span>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Este saldo es acreditado de forma digital a la cuenta registrada en la <strong>App SuperGIROS</strong> sin requerir despacho físico.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-emerald-200/60 text-[11px]">
                <div>
                  <span className="text-emerald-700 block">Cédula App:</span>
                  <strong className="text-emerald-950">{order.supergirosDocument || order.allyDocument}</strong>
                </div>
                <div>
                  <span className="text-emerald-700 block">Titular App:</span>
                  <strong className="text-emerald-950 truncate block">{order.supergirosName || order.allyName}</strong>
                </div>
                <div>
                  <span className="text-emerald-700 block">Celular Registrado:</span>
                  <strong className="text-emerald-950">{order.supergirosPhone || order.allyPhone}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Points Total Summary */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-800">Total Puntos Deducidos:</span>
            <div className="flex items-center gap-2 font-black text-xl text-blue-900">
              <CoinIcon className="w-5 h-5" />
              <span>{formatPoints(order.totalPoints)}</span>
              <span className="text-xs font-bold text-slate-700">pts</span>
            </div>
          </div>

          {/* Security stamp & barcode representation */}
          <div className="pt-4 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Transacción cifrada y validada por Superpuntos S.A.S.</span>
            </div>
            <span className="font-mono break-all">{order.id}</span>
          </div>

        </div>

        {/* Modal Bottom Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Cerrar Comprobante
          </button>
        </div>

      </div>
    </div>
  );
};
