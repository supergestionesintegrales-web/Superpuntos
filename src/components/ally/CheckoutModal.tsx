import React, { useState } from 'react';
import { 
  X, 
  Coins, 
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
  const [shippingAddress, setShippingAddress] = useState(currentUser.businessName ? `${currentUser.businessName} - ${currentUser.zone}` : '');
  const [shippingCity, setShippingCity] = useState(currentUser.zone.split('-')[0]?.trim() || 'Bogotá D.C.');
  const [shippingDepartment, setShippingDepartment] = useState('Cundinamarca');
  const [recipientName, setRecipientName] = useState(currentUser.name);
  const [recipientPhone, setRecipientPhone] = useState(currentUser.phone);

  // Branch pickup data (Artículos)
  const [pickupOffice, setPickupOffice] = useState(SUPERGIROS_MAIN_OFFICES[0]);
  const [pickupCustomOffice, setPickupCustomOffice] = useState('');
  const [pickupPersonName, setPickupPersonName] = useState(currentUser.name);
  const [pickupPersonDoc, setPickupPersonDoc] = useState(currentUser.documentId);
  const [pickupPersonPhone, setPickupPersonPhone] = useState(currentUser.phone);

  // App SuperGIROS data (Bonos de dinero)
  const [supergirosDoc, setSupergirosDoc] = useState(currentUser.documentId || '');
  const [supergirosName, setSupergirosName] = useState(currentUser.name || '');
  const [supergirosPhone, setSupergirosPhone] = useState(currentUser.phone || '');

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
                Finalizar Canje
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Confirmación y Entrega de Premios
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
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Premios a Canjear ({cart.length})
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                {hasPhysicalItems && (
                  <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                    📦 Artículos Físicos
                  </span>
                )}
                {hasBonos && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    📱 Bonos App SuperGIROS
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
                            : 'bg-amber-100 text-amber-600 border-amber-200'
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
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {isItemBono ? 'Carga App SuperGiros' : 'Despacho Físico'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-amber-600 shrink-0 pl-2">
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
            <div className="space-y-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Despacho de Artículos Físicos
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Los artículos son los únicos productos con despacho. Elige cómo recibirlos:
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
                      ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs' 
                      : 'bg-white/80 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    physicalDeliveryMode === 'shipping' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">Envío a Domicilio</p>
                      {physicalDeliveryMode === 'shipping' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Recibir en tu dirección o punto comercial</p>
                  </div>
                </div>

                {/* Option 2: Pickup at Main Office */}
                <div
                  onClick={() => setPhysicalDeliveryMode('branch_pickup')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    physicalDeliveryMode === 'branch_pickup' 
                      ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs' 
                      : 'bg-white/80 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    physicalDeliveryMode === 'branch_pickup' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">Retirar en Oficina Principal</p>
                      {physicalDeliveryMode === 'branch_pickup' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Retiro en ventanilla Oficina SuperGIROS</p>
                  </div>
                </div>
              </div>

              {/* Sub-form A: Shipping to address */}
              {physicalDeliveryMode === 'shipping' && (
                <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <UserIcon className="w-3 h-3 text-amber-500" />
                        <span>Nombre de Quien Recibe *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-amber-500" />
                        <span>Teléfono Celular de Contacto *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="Ej: 310 123 4567"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      <span>Dirección Completa de Entrega *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Calle 15 # 24-50 Local 1 (Punto de Venta / Domicilio)"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
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
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Departamento</label>
                      <input
                        type="text"
                        value={shippingDepartment}
                        onChange={(e) => setShippingDepartment(e.target.value)}
                        placeholder="Ej: Cundinamarca"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-form B: Pickup at SuperGIROS Main Office */}
              {physicalDeliveryMode === 'branch_pickup' && (
                <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 mt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Building className="w-3 h-3 text-amber-500" />
                      <span>Seleccionar Oficina Principal SuperGIROS *</span>
                    </label>
                    <select
                      value={pickupOffice}
                      onChange={(e) => setPickupOffice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
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
                        className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
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
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
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
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
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
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Para reclamar en oficina principal, la persona autorizada debe presentar su cédula original física y el comprobante de canje.</span>
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
                    Los bonos de dinero <strong>no tienen despacho físico</strong>: son cargados directamente al saldo de tu cuenta en la <strong>App SuperGIROS</strong>. Ingresa con exactitud los datos con los que te registraste en la aplicación:
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
                  <span>El saldo será abonado a este número y cédula para que puedas retirarlo o enviarlo como giro de forma inmediata.</span>
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
              Confirmo que deseo redimir estos premios y que la información diligenciada es verídica para proceder con el despacho o la acreditación del bono.
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
