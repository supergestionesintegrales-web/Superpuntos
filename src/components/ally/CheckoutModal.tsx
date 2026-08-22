import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Truck, 
  Zap, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Building, 
  User as UserIcon, 
  Phone,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryType, RedemptionOrder } from '../../types';
import { formatPoints } from '../../utils/helpers';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: RedemptionOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { cart, cartPointsTotal, currentUser, redeemCart } = useApp();

  const isAllDigital = cart.every(item => item.product.isDigital);
  const hasDigitalAndPhysical = cart.some(item => item.product.isDigital) && cart.some(item => !item.product.isDigital);

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(isAllDigital ? 'digital' : 'shipping');
  const [shippingAddress, setShippingAddress] = useState(currentUser.businessName ? `${currentUser.businessName} - ${currentUser.zone}` : '');
  const [shippingCity, setShippingCity] = useState(currentUser.zone.split('-')[0]?.trim() || 'Bogotá D.C.');
  const [shippingDepartment, setShippingDepartment] = useState('Cundinamarca');
  const [recipientName, setRecipientName] = useState(currentUser.name);
  const [recipientPhone, setRecipientPhone] = useState(currentUser.phone);
  const [notes, setNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!agreedTerms) {
      setErrorMsg('Debes aceptar los términos de canje para continuar.');
      return;
    }

    if (deliveryType === 'shipping') {
      if (!shippingAddress.trim() || !shippingCity.trim()) {
        setErrorMsg('Por favor completa la dirección y ciudad de entrega.');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const result = redeemCart({
        deliveryType,
        shippingAddress: deliveryType === 'shipping' ? shippingAddress.trim() : undefined,
        shippingCity: deliveryType === 'shipping' ? shippingCity.trim() : undefined,
        shippingDepartment: deliveryType === 'shipping' ? shippingDepartment.trim() : undefined,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        notes: notes.trim() || undefined
      });

      if (result.success && result.order) {
        setIsProcessing(false);
        onClose();
        onSuccess(result.order);
      } else {
        setErrorMsg(result.message || 'No fue posible procesar el canje.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocurrió un error inesperado.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                Paso Final de Canje
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Confirmar y Redimir Premios
              </h2>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Items Summary in Checkout */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Premios a Canjear ({cart.length})
            </label>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 divide-y divide-slate-200/70 max-h-40 overflow-y-auto">
              {cart.map(item => (
                <div key={item.product.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.quantity} un. x {formatPoints(item.product.pointsCost)} pts
                      </p>
                    </div>
                  </div>
                  <div className="font-bold text-amber-600 shrink-0 pl-2">
                    {formatPoints(item.product.pointsCost * item.quantity)} pts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Modalidad de Entrega / Despacho *
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Option 1: Shipping to address */}
              <div
                onClick={() => setDeliveryType('shipping')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  deliveryType === 'shipping' 
                    ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    deliveryType === 'shipping' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  {deliveryType === 'shipping' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Envío Físico</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">A tu dirección o punto comercial</p>
                </div>
              </div>

              {/* Option 2: Digital Instant */}
              <div
                onClick={() => setDeliveryType('digital')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  deliveryType === 'digital' 
                    ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    deliveryType === 'digital' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  {deliveryType === 'digital' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Bono Digital</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Vía Email & SMS inmediato</p>
                </div>
              </div>

              {/* Option 3: Branch pickup */}
              <div
                onClick={() => setDeliveryType('branch_pickup')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  deliveryType === 'branch_pickup' 
                    ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    deliveryType === 'branch_pickup' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Building className="w-4 h-4" />
                  </div>
                  {deliveryType === 'branch_pickup' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Retiro en Sede</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Oficina regional comercial</p>
                </div>
              </div>

            </div>
          </div>

          {/* Delivery Details Form */}
          {deliveryType === 'shipping' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Datos del Destinatario y Dirección</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Nombre de Quien Recibe *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Teléfono Celular de Contacto *</label>
                  <input
                    type="text"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Dirección Completa (con barrio o punto) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cra 15 # 72-30 Local 102 (Punto de Venta La 72)"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Ciudad / Municipio *</label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Departamento</label>
                  <input
                    type="text"
                    value={shippingDepartment}
                    onChange={(e) => setShippingDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {deliveryType === 'digital' && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-900">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>Confirmación de Envío Digital Inmediato</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Los pines y vouchers digitales se generarán en pantalla inmediatamente y se remitirán a: <strong>{currentUser.email}</strong> y celular <strong>{currentUser.phone}</strong>.
              </p>
            </div>
          )}

          {/* Observations */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Instrucciones o Notas Especiales</label>
            <input
              type="text"
              placeholder="Ej: Entregar en horario de oficina de 8:00 AM a 6:00 PM"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Total & Confirmation summary */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/90 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-900 block">Total Superpuntos a Descontar:</span>
              <span className="text-[10px] text-slate-600">
                Saldo actual: {formatPoints(currentUser.pointsBalance)} pts → Nuevo saldo: {formatPoints(currentUser.pointsBalance - cartPointsTotal)} pts
              </span>
            </div>
            <div className="text-right font-black text-2xl text-amber-600 flex items-center gap-1.5">
              <Coins className="w-6 h-6 text-amber-500" />
              <span>{formatPoints(cartPointsTotal)}</span>
              <span className="text-xs font-bold text-slate-700">pts</span>
            </div>
          </div>

          {/* Agreement checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 mt-0.5"
            />
            <span>
              Confirmo que deseo redimir estos premios usando mi saldo de Superpuntos y autorizo el descuento de mi cuenta.
            </span>
          </label>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Regresar al Carrito
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Procesando Canje...' : 'Confirmar y Generar Comprobante'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
