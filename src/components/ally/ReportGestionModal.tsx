import React, { useState } from 'react';
import { 
  Car, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Building2,
  CarFront,
  SendHorizontal,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ReportGestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const INSURANCE_COMPANIES = [
  'Seguros Mundial',
  'Seguros del Estado',
  'Suramericana (Sura)',
  'AXA Colpatria',
  'La Previsora Seguros',
  'Seguros Bolívar',
  'Aseguradora Solidaria',
  'Allianz Colombia',
  'Liberty Seguros',
  'Equidad Seguros'
];

const VEHICLE_TYPES = [
  'Carro / Automóvil Particular',
  'Camioneta / Campero',
  'Motocicleta (100cc - 200cc+)',
  'Taxi / Transporte Público',
  'Vehículo de Carga / Camión'
];

export const ReportGestionModal: React.FC<ReportGestionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { campaigns, reportGestion, currentUser } = useApp();

  const activeCampaigns = campaigns.filter(c => c.active);
  const soatCampaign = activeCampaigns.find(c => c.id === 'cmp_soat' || c.serviceType.toLowerCase().includes('soat')) || activeCampaigns[0];

  // SOAT Fields
  const [licensePlate, setLicensePlate] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [soatQuantity, setSoatQuantity] = useState<number>(1);
  const [insuranceCompany, setInsuranceCompany] = useState('Seguros Mundial');
  const [vehicleType, setVehicleType] = useState('Carro / Automóvil Particular');
  const [transactionValue, setTransactionValue] = useState<string>('685000');
  const [clientName, setClientName] = useState('');
  const [clientDocument, setClientDocument] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPlate = licensePlate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanPolicy = policyNumber.trim();

    if (!cleanPlate) {
      setErrorMsg('Por favor ingresa la Placa del vehículo.');
      return;
    }
    if (!cleanPolicy) {
      setErrorMsg('Por favor ingresa el Número de Póliza SOAT.');
      return;
    }
    if (soatQuantity < 1) {
      setErrorMsg('La cantidad de SOATs debe ser al menos 1.');
      return;
    }

    setIsSubmitting(true);

    try {
      reportGestion({
        campaignId: soatCampaign ? soatCampaign.id : 'cmp_soat',
        referenceNumber: cleanPolicy,
        licensePlate: cleanPlate,
        policyNumber: cleanPolicy,
        soatQuantity: soatQuantity,
        insuranceCompany: insuranceCompany,
        vehicleType: vehicleType,
        transactionValue: transactionValue ? parseFloat(transactionValue) : undefined,
        clientName: clientName.trim() || undefined,
        clientDocument: clientDocument.trim() || undefined
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setIsSubmitting(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 2200);
    } catch (err) {
      setErrorMsg('Error al enviar la información de la póliza. Por favor intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
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
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                  Promocional SOAT
                </span>
                <span className="text-xs text-slate-300">Aliado: {currentUser.name}</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Registrar Venta de SOAT
              </h2>
            </div>
          </div>
        </div>

        {/* Success Message Overlay */}
        {submittedSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">¡Enviado a Comprobar! 🎉</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Tu registro de SOAT {licensePlate ? `(Placa ${licensePlate.toUpperCase()})` : ''} ha sido enviado al Administrador con estado <strong className="text-amber-600">"Pendiente de Validación"</strong>.
              </p>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto text-xs text-slate-700 font-medium">
                Una vez el Administrador verifique y confirme la póliza en RUNT, los Superpuntos se acreditarán automáticamente en tu cuenta.
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Informational Prompt */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-700">
                Ingresa los datos exactos de la póliza emitida. Toda la información será verificada con las aseguradoras y el RUNT antes de la aprobación.
              </p>
            </div>

            {/* Datos del Vehículo y Póliza */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Datos del Vehículo y Póliza *
                </label>
                <span className="text-[11px] text-slate-500">Requerido para comprobación</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* License Plate */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CarFront className="w-3.5 h-3.5 text-amber-600" />
                    <span>Placa del Vehículo *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={7}
                      placeholder="Ej: BGL412 o NVK88F"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm tracking-wider text-slate-900 bg-amber-50/20 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 uppercase"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      COLOMBIA
                    </span>
                  </div>
                </div>

                {/* Policy Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Número de Póliza Digital *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: POL-SOAT-8829104"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Insurance Company */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Aseguradora</span>
                  </label>
                  <select
                    value={insuranceCompany}
                    onChange={(e) => setInsuranceCompany(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-amber-500 bg-white"
                  >
                    {INSURANCE_COMPANIES.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Type */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Tipo de Vehículo
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-amber-500 bg-white"
                  >
                    {VEHICLE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity of SOATs */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Cantidad de SOATs
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={soatQuantity}
                    onChange={(e) => setSoatQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 text-center focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Commercial Value & Client details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Valor Pagado de la Póliza ($ COP)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 685000"
                    value={transactionValue}
                    onChange={(e) => setTransactionValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Nombre del Tomador / Propietario (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Alejandro Morales"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/30 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
              >
                <SendHorizontal className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar a Comprobar'}</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
