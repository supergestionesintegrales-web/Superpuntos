import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  Banknote, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Building, 
  User as UserIcon, 
  Phone,
  Gift,
  CreditCard,
  Smartphone,
  Info
} from 'lucide-react';
import { CoinIcon } from '../common/CoinIcon';
import { useApp } from '../../context/AppContext';
import { DeliveryType, RedemptionOrder } from '../../types';
import { formatPoints } from '../../utils/helpers';

const SUPERGIROS_MAIN_OFFICES = [
  'Oficina Principal SuperGIROS - Centro (Cra 5 # 14-32)',
  'Oficina Principal SuperGIROS - Sede Norte (Av. Principal # 78-15)',
  'Oficina Principal SuperGIROS - Sede Regional Occidente',
  'Oficina Principal SuperGIROS - Sede Principal de la Zona / Municipio'
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: RedemptionOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { cart, cartPointsTotal, currentUser, redeemCart } = useApp();

  // Determine what types of items are in the cart
  const hasPhysicalItems = cart.some(item => !item.product.isDigital && item.product.category !== 'Bonos');
  const hasBonos = cart.some(item => item.product.isDigital || item.product.category === 'Bonos');

  // Physical delivery selection (Envío a domicilio vs Retirar en Oficina Principal SuperGIROS)
  const [physicalDeliveryMode, setPhysicalDeliveryMode] = useState<'shipping' | 'branch_pickup'>('shipping');
  
  // Shipping data (Artículos)
  const userZone = currentUser?.zone || '';
  const defaultCity = userZone ? (userZone.includes('-') ? userZone.split('-')[0]?.trim() : userZone.trim()) : 'Bogotá D.C.';

  const [shippingAddress, setShippingAddress] = useState(
    currentUser?.businessName 
      ? `${currentUser.businessName}${userZone ? ` - ${userZone}` : ''}` 
      : (userZone || '')
  );
  const [shippingCity, setShippingCity] = useState(defaultCity || 'Bogotá D.C.');
  const [shippingDepartment, setShippingDepartment] = useState('Cundinamarca');
  const [recipientName, setRecipientName] = useState(currentUser?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(currentUser?.phone || '');

  // Branch pickup data (Artículos)
  const [pickupOffice, setPickupOffice] = useState(SUPERGIROS_MAIN_OFFICES[0]);
  const [pickupCustomOffice, setPickupCustomOffice] = useState('');
  const [pickupPersonName, setPickupPersonName] = useState(currentUser?.name || '');
  const [pickupPersonDoc, setPickupPersonDoc] = useState(currentUser?.documentId || '');
  const [pickupPersonPhone, setPickupPersonPhone] = useState(currentUser?.phone || '');

  // App SuperGIROS data (Bonos de dinero)
  const [supergirosDoc, setSupergirosDoc] = useState(currentUser?.documentId || '');
  const [supergirosName, setSupergirosName] = useState(currentUser?.name || '');
  const [supergirosPhone, setSupergirosPhone] = useState(currentUser?.phone || '');

  // Sync state if currentUser changes or modal reopens
  useEffect(() => {
    if (isOpen && currentUser) {
      const currentZone = currentUser.zone || '';
      const city = currentZone ? (currentZone.includes('-') ? currentZone.split('-')[0]?.trim() : currentZone.trim()) : 'Bogotá D.C.';
      
      setShippingAddress(
        currentUser.businessName 
          ? `${currentUser.businessName}${currentZone ? ` - ${currentZone}` : ''}` 
          : (currentZone || '')
      );
      setShippingCity(city || 'Bogotá D.C.');
      setRecipientName(currentUser.name || '');
      setRecipientPhone(currentUser.phone || '');
      setPickupPersonName(currentUser.name || '');
      setPickupPersonDoc(currentUser.documentId || '');
      setPickupPersonPhone(currentUser.phone || '');
      setSupergirosDoc(currentUser.documentId || '');
      setSupergirosName(currentUser.name || '');
      setSupergirosPhone(currentUser.phone || '');
    }
  }, [isOpen, currentUser]);

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

    // Validate Physical Articles if present
    if (hasPhysicalItems) {
      if (physicalDeliveryMode === 'shipping') {
        if (!shippingAddress.trim() || !shippingCity.trim()) {
          setErrorMsg('Por favor completa la dirección completa y ciudad de entrega para el despacho de los artículos.');
          return;
        }
        if (!recipientName.trim() || !recipientPhone.trim()) {
          setErrorMsg('Por favor indica el nombre y teléfono de la persona que recibirá los artículos.');
          return;
        }
      } else if (physicalDeliveryMode === 'branch_pickup') {
        const finalOffice = pickupOffice === 'custom' ? pickupCustomOffice.trim() : pickupOffice.trim();
        if (!finalOffice) {
          setErrorMsg('Por favor indica la Oficina Principal de SuperGIROS donde retirarás los artículos.');
          return;
        }
        if (!pickupPersonName.trim() || !pickupPersonDoc.trim() || !pickupPersonPhone.trim()) {
          setErrorMsg('Por favor completa los datos de la persona que retirará los artículos en la oficina principal.');
          return;
        }
      }
    }

    // Validate Bonos if present
    if (hasBonos) {
      if (!supergirosDoc.trim()) {
        setErrorMsg('Por favor ingresa la cédula registrada en tu App SuperGIROS para la carga del bono.');
        return;
      }
      if (!supergirosName.trim()) {
        setErrorMsg('Por favor ingresa tu nombre completo registrado en tu App SuperGIROS.');
        return;
      }
      if (!supergirosPhone.trim()) {
        setErrorMsg('Por favor ingresa el número de teléfono celular registrado en tu App SuperGIROS.');
        return;
      }
    }

    // Determine final deliveryType enum
    let finalDeliveryType: DeliveryType = 'digital';
    if (hasPhysicalItems && hasBonos) {
      finalDeliveryType = 'mixed';
    } else if (hasPhysicalItems) {
      finalDeliveryType = physicalDeliveryMode;
    } else {
      finalDeliveryType = 'digital';
    }

    const selectedOfficeName = physicalDeliveryMode === 'branch_pickup' 
      ? (pickupOffice === 'custom' ? pickupCustomOffice.trim() : pickupOffice) 
      : undefined;

    setIsProcessing(true);

    try {
      const result = redeemCart({
        deliveryType: finalDeliveryType,
        shippingAddress: hasPhysicalItems && physicalDeliveryMode === 'shipping' ? shippingAddress.trim() : undefined,
        shippingCity: hasPhysicalItems && physicalDeliveryMode === 'shipping' ? shippingCity.trim() : undefined,
        shippingDepartment: hasPhysicalItems && physicalDeliveryMode === 'shipping' ? shippingDepartment.trim() : undefined,
        pickupOffice: selectedOfficeName,
        recipientName: hasPhysicalItems 
          ? (physicalDeliveryMode === 'shipping' ? recipientName.trim() : pickupPersonName.trim())
          : undefined,
        recipientPhone: hasPhysicalItems 
          ? (physicalDeliveryMode === 'shipping' ? recipientPhone.trim() : pickupPersonPhone.trim())
          : undefined,
        pickupPersonDocument: hasPhysicalItems && physicalDeliveryMode === 'branch_pickup' ? pickupPersonDoc.trim() : undefined,
        supergirosDocument: hasBonos ? supergirosDoc.trim() : undefined,
        supergirosName: hasBonos ? supergirosName.trim() : undefined,
        supergirosPhone: hasBonos ? supergirosPhone.trim() : undefined,
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
      setErrorMsg(err?.message || 'Ocurrió un error inesperado al procesar.');
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
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-6 relative border-b border-blue-900/40">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 pr-8 sm:pr-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-900/80 border border-blue-700/50 flex items-center justify-center shadow-inner shrink-0">
              <CoinIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-blue-800/50 text-blue-200 border border-blue-700/50 px-2 py-0.5 rounded-full">
                Finalizar Canje
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Confirmación y Entrega de Premios
              </h2>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Items Summary in Checkout */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Premios a Canjear ({cart.length})
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                {hasPhysicalItems && (
                  <span className="bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                    📦 Artículos (Con Despacho)
                  </span>
                )}
                {hasBonos && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    📱 Bonos (Carga App SuperGIROS)
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 divide-y divide-slate-200/70 max-h-44 overflow-y-auto">
              {cart.map(item => {
                const isItemBono = item.product.isDigital || item.product.category === 'Bonos';
                return (
                  <div key={item.product.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.product.imageUrl ? (
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-contain p-0.5 mix-blend-multiply"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs ${
                          isItemBono
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-blue-100 text-blue-900 border-blue-200'
                        }`}>
                          {isItemBono ? <Banknote className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-500">
                            {item.quantity} un. x {formatPoints(item.product.pointsCost)} pts
                          </span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-sm ${
                            isItemBono 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-blue-50 text-blue-900 border border-blue-200'
                          }`}>
                            {isItemBono ? 'Carga App SuperGIROS (Sin Despacho)' : 'Con Despacho Físico'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-blue-900 shrink-0 pl-2">
                      {formatPoints(item.product.pointsCost * item.quantity)} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              SECTION 1: PHYSICAL ARTICLES DISPATCH (Only if cart has physical items)
              ========================================================================= */}
          {hasPhysicalItems && (
            <div className="space-y-3 p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-900 text-white flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Despacho de Artículos Físicos
                    </h4>
                    <p className="text-[10px] text-slate-600">
                      Los únicos productos con despacho son los <strong>artículos</strong>. Diligencia los datos de dirección donde recibir o la opción de retirar en Oficina Principal SuperGIROS:
                    </p>
                  </div>
                </div>
              </div>

              {/* 2 Exclusive Options for Physical Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Option 1: Shipping to Address */}
                <div
                  onClick={() => setPhysicalDeliveryMode('shipping')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    physicalDeliveryMode === 'shipping' 
                      ? 'bg-white border-blue-800 ring-2 ring-blue-800/20 shadow-xs' 
                      : 'bg-white/80 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    physicalDeliveryMode === 'shipping' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">Dirección donde recibir</p>
                      {physicalDeliveryMode === 'shipping' && <CheckCircle2 className="w-4 h-4 text-blue-800" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Despacho a tu domicilio o dirección indicada</p>
                  </div>
                </div>

                {/* Option 2: Pickup at Main Office */}
                <div
                  onClick={() => setPhysicalDeliveryMode('branch_pickup')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    physicalDeliveryMode === 'branch_pickup' 
                      ? 'bg-white border-blue-800 ring-2 ring-blue-800/20 shadow-xs' 
                      : 'bg-white/80 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    physicalDeliveryMode === 'branch_pickup' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">Retirar en Oficina Principal SuperGIROS</p>
                      {physicalDeliveryMode === 'branch_pickup' && <CheckCircle2 className="w-4 h-4 text-blue-800" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Reclamar en ventanilla de Oficina Principal</p>
                  </div>
                </div>
              </div>

              {/* Sub-form A: Shipping to address */}
              {physicalDeliveryMode === 'shipping' && (
                <div className="space-y-3 bg-white p-3.5 rounded-xl border border-blue-200/80 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <UserIcon className="w-3 h-3 text-blue-800" />
                        <span>Nombre de Quien Recibe *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-800 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-blue-800" />
                        <span>Teléfono Celular de Contacto *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="Ej: 310 123 4567"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-800 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-800" />
                      <span>Dirección donde recibir *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Calle 15 # 24-50 Local 1 (Dirección completa donde recibirás)"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-800 bg-white"
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
                        placeholder="Ej: Bogotá D.C."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-800 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Departamento</label>
                      <input
                        type="text"
                        value={shippingDepartment}
                        onChange={(e) => setShippingDepartment(e.target.value)}
                        placeholder="Ej: Cundinamarca"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-800 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-form B: Pickup at SuperGIROS Main Office */}
              {physicalDeliveryMode === 'branch_pickup' && (
                <div className="space-y-3 bg-white p-3.5 rounded-xl border border-blue-200/80 mt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Building className="w-3 h-3 text-blue-800" />
                      <span>Seleccionar Oficina Principal SuperGIROS *</span>
                    </label>
                    <select
                      value={pickupOffice}
                      onChange={(e) => setPickupOffice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-800 bg-white"
                    >
                      {SUPERGIROS_MAIN_OFFICES.map((office, idx) => (
                        <option key={idx} value={office}>
                          {office}
                        </option>
                      ))}
                      <option value="custom">-- Otra Oficina Principal SuperGIROS --</option>
                    </select>

                    {pickupOffice === 'custom' && (
                      <input
                        type="text"
                        required
                        placeholder="Escribe el nombre o dirección de la Oficina Principal SuperGIROS"
                        value={pickupCustomOffice}
                        onChange={(e) => setPickupCustomOffice(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-800 bg-white"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Nombre de Quien Retira *</label>
                      <input
                        type="text"
                        required
                        value={pickupPersonName}
                        onChange={(e) => setPickupPersonName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-800 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Cédula de Quien Retira *</label>
                      <input
                        type="text"
                        required
                        value={pickupPersonDoc}
                        onChange={(e) => setPickupPersonDoc(e.target.value)}
                        placeholder="Número de cédula"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-800 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Teléfono de Contacto *</label>
                      <input
                        type="text"
                        required
                        value={pickupPersonPhone}
                        onChange={(e) => setPickupPersonPhone(e.target.value)}
                        placeholder="Ej: 310 123 4567"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-blue-800 bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-[10px] text-blue-900 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-800 shrink-0 mt-0.5" />
                    <span>Para retirar en la Oficina Principal SuperGIROS, la persona autorizada debe presentar su cédula original física y el comprobante de canje.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              SECTION 2: MONEY VOUCHERS CARGA A APP SUPERGIROS (Only if cart has bonos)
              ========================================================================= */}
          {hasBonos && (
            <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-emerald-950">
                      Datos para Carga en App SuperGIROS (Bonos de Dinero)
                    </h4>
                    <span className="text-[9px] font-extrabold uppercase tracking-wide bg-emerald-200 text-emerald-900 px-2 py-0.2 rounded-full">
                      Sin despacho físico
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                    Los bonos de dinero <strong>no tienen despacho físico</strong>: son cargados a tu <strong>App SuperGIROS</strong>. Para esto debes dejar tus datos con los que te registraste en la aplicación:
                  </p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Cédula registrada en App SuperGiros */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-emerald-600" />
                      <span>Cédula en App SuperGIROS *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={supergirosDoc}
                      onChange={(e) => setSupergirosDoc(e.target.value)}
                      placeholder="Cédula registrada"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white"
                    />
                  </div>

                  {/* Nombre registrado en App SuperGiros */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-emerald-600" />
                      <span>Nombre en App SuperGIROS *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={supergirosName}
                      onChange={(e) => setSupergirosName(e.target.value)}
                      placeholder="Nombre y apellidos"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white"
                    />
                  </div>

                  {/* Teléfono con el que se registró en App SuperGiros */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-emerald-600" />
                      <span>Teléfono en App SuperGIROS *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={supergirosPhone}
                      onChange={(e) => setSupergirosPhone(e.target.value)}
                      placeholder="Celular registrado"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-white"
                    />
                  </div>

                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-[10px] text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>El saldo será acreditado directamente a tu App SuperGIROS vinculada a estos datos para disponibilidad inmediata.</span>
                </div>
              </div>
            </div>
          )}

          {/* Observations */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Instrucciones o Notas Adicionales (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Entregar en horario comercial o indicar detalle de la sede"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-800"
            />
          </div>

          {/* Total & Confirmation summary */}
          <div className="bg-blue-50/80 rounded-2xl p-3.5 sm:p-4 border border-blue-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-blue-950 block">Total Superpuntos a Descontar:</span>
              <span className="text-[10px] text-slate-600">
                Saldo actual: {formatPoints(currentUser.pointsBalance)} pts → Nuevo saldo: {formatPoints(currentUser.pointsBalance - cartPointsTotal)} pts
              </span>
            </div>
            <div className="text-right font-black text-xl sm:text-2xl text-blue-900 flex items-center gap-2">
              <CoinIcon className="w-5 h-5 sm:w-6 sm:h-6" />
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
              className="rounded-md border-slate-300 text-blue-900 focus:ring-blue-800 mt-0.5 shrink-0"
            />
            <span>
              Confirmo que deseo redimir estos premios y que la información diligenciada es verídica para proceder con el despacho o la acreditación del bono.
            </span>
          </label>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              Regresar al Carrito
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white shadow-lg shadow-blue-950/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-blue-300 shrink-0" />
              <span>{isProcessing ? 'Procesando Canje...' : 'Confirmar y Generar Comprobante'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
