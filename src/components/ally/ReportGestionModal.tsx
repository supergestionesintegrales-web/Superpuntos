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
  FileCheck,
  Plus,
  Trash2
} from 'lucide-react';
import { CoinIcon } from '../common/CoinIcon';
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

interface SoatItem {
  id: string;
  licensePlate: string;
  policyNumber: string;
  insuranceCompany: string;
  vehicleType: string;
  transactionValue: string;
  clientName: string;
  clientDocument: string;
}

export const ReportGestionModal: React.FC<ReportGestionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { campaigns, reportGestion, reportMultipleGestiones, currentUser } = useApp();

  const activeCampaigns = campaigns.filter(c => c.active);
  const soatCampaign = activeCampaigns.find(c => c.id === 'cmp_soat' || c.serviceType.toLowerCase().includes('soat')) || activeCampaigns[0];

  // List of SOATs to report together. Starts with 1 by default.
  const [soatList, setSoatList] = useState<SoatItem[]>([
    {
      id: 'soat_init_1',
      licensePlate: '',
      policyNumber: '',
      insuranceCompany: 'Seguros Mundial',
      vehicleType: 'Carro / Automóvil Particular',
      transactionValue: '685000',
      clientName: '',
      clientDocument: ''
    }
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(1);

  if (!isOpen) return null;

  // Add another SOAT to the batch
  const handleAddSoat = () => {
    setErrorMsg(null);
    const lastItem = soatList[soatList.length - 1];
    setSoatList(prev => [
      ...prev,
      {
        id: `soat_${Date.now()}_${prev.length + 1}`,
        licensePlate: '',
        policyNumber: '',
        insuranceCompany: lastItem?.insuranceCompany || 'Seguros Mundial',
        vehicleType: lastItem?.vehicleType || 'Carro / Automóvil Particular',
        transactionValue: lastItem?.transactionValue || '685000',
        clientName: '',
        clientDocument: ''
      }
    ]);
  };

  // Remove a SOAT from the batch (only allowed if > 1)
  const handleRemoveSoat = (id: string) => {
    if (soatList.length <= 1) return;
    setSoatList(prev => prev.filter(s => s.id !== id));
  };

  // Update specific field in a SOAT item
  const handleUpdateField = (id: string, field: keyof SoatItem, value: string) => {
    setSoatList(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    const platesSeen = new Set<string>();
    const policiesSeen = new Set<string>();

    for (let i = 0; i < soatList.length; i++) {
      const item = soatList[i];
      const cleanPlate = item.licensePlate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const cleanPolicy = item.policyNumber.trim().toUpperCase();

      if (!cleanPlate) {
        setErrorMsg(`Por favor ingresa la Placa del vehículo en el SOAT #${i + 1}.`);
        return;
      }
      if (!cleanPolicy) {
        setErrorMsg(`Por favor ingresa el Número de Póliza en el SOAT #${i + 1}.`);
        return;
      }

      if (platesSeen.has(cleanPlate)) {
        setErrorMsg(`La placa ${cleanPlate} está repetida en esta comprobación (SOAT #${i + 1}). Cada SOAT debe ser único.`);
        return;
      }
      platesSeen.add(cleanPlate);

      if (policiesSeen.has(cleanPolicy)) {
        setErrorMsg(`El número de póliza ${cleanPolicy} está repetido (SOAT #${i + 1}). Cada póliza debe ser única.`);
        return;
      }
      policiesSeen.add(cleanPolicy);
    }

    setIsSubmitting(true);

    try {
      const campaignId = soatCampaign ? soatCampaign.id : 'cmp_soat';

      if (soatList.length === 1) {
        const item = soatList[0];
        reportGestion({
          campaignId,
          referenceNumber: item.policyNumber.trim(),
          licensePlate: item.licensePlate.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''),
          policyNumber: item.policyNumber.trim(),
          soatQuantity: 1,
          insuranceCompany: item.insuranceCompany,
          vehicleType: item.vehicleType,
          transactionValue: item.transactionValue ? parseFloat(item.transactionValue) : undefined,
          clientName: item.clientName.trim() || undefined,
          clientDocument: item.clientDocument.trim() || undefined
        });
      } else {
        const itemsToReport = soatList.map(item => ({
          campaignId,
          referenceNumber: item.policyNumber.trim(),
          licensePlate: item.licensePlate.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''),
          policyNumber: item.policyNumber.trim(),
          soatQuantity: 1,
          insuranceCompany: item.insuranceCompany,
          vehicleType: item.vehicleType,
          transactionValue: item.transactionValue ? parseFloat(item.transactionValue) : undefined,
          clientName: item.clientName.trim() || undefined,
          clientDocument: item.clientDocument.trim() || undefined
        }));

        reportMultipleGestiones(itemsToReport);
      }

      setSubmittedCount(soatList.length);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setIsSubmitting(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 2300);
    } catch (err) {
      console.error('Error reporting SOAT(s):', err);
      setErrorMsg('Error al enviar la comprobación de los SOATs. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  const pointsPerSoat = soatCampaign?.pointsValue || 5;
  const totalExpectedPoints = soatList.length * pointsPerSoat;

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
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                  SOAT Único y Comprobación
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
                {submittedCount === 1 
                  ? 'Tu SOAT ha sido enviado al Administrador con estado "Pendiente de Validación".' 
                  : `Tus ${submittedCount} SOATs únicos han sido registrados con éxito en una sola comprobación.`}
              </p>
              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200/80 max-w-sm mx-auto text-xs text-blue-900 font-medium">
                Al ser aprobados por la administración, se acreditarán automáticamente <strong className="text-blue-900 font-black">+{totalExpectedPoints} Superpuntos</strong> a tu saldo.
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Informational Prompt */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shrink-0">
                <FileCheck className="w-4 h-4 text-blue-200" />
              </div>
              <div className="text-xs text-slate-700 leading-relaxed">
                Cada SOAT es único con su propia placa y número de póliza oficial. Si tienes más pólizas para registrar en esta misma comprobación, haz clic en <strong className="text-blue-900 font-bold">"+ Agregar otro SOAT"</strong>.
              </div>
            </div>

            {/* Dynamic List of Unique SOATs */}
            <div className="space-y-4">
              {soatList.map((item, index) => (
                <div 
                  key={item.id} 
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3.5 relative transition-all"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-black text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        SOAT #{index + 1} (Único)
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        +{pointsPerSoat} pts
                      </span>
                    </div>

                    {soatList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSoat(item.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        title="Quitar este SOAT"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* License Plate */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <CarFront className="w-3.5 h-3.5 text-blue-800" />
                        <span>Placa del Vehículo *</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={7}
                          placeholder="Ej: BGL412 o NVK88F"
                          value={item.licensePlate}
                          onChange={(e) => handleUpdateField(item.id, 'licensePlate', e.target.value.toUpperCase())}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-sm tracking-wider text-slate-900 bg-white focus:outline-hidden focus:border-blue-700 uppercase"
                        />
                        <span className="absolute right-2.5 top-2 text-[9px] font-black text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                          COLOMBIA
                        </span>
                      </div>
                    </div>

                    {/* Policy Number */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-800" />
                        <span>Número de Póliza SOAT Digital *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: POL-SOAT-8829104"
                        value={item.policyNumber}
                        onChange={(e) => handleUpdateField(item.id, 'policyNumber', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-700 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Insurance Company */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>Aseguradora</span>
                      </label>
                      <select
                        value={item.insuranceCompany}
                        onChange={(e) => handleUpdateField(item.id, 'insuranceCompany', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-blue-700 bg-white"
                      >
                        {INSURANCE_COMPANIES.map(company => (
                          <option key={company} value={company}>{company}</option>
                        ))}
                      </select>
                    </div>

                    {/* Vehicle Type */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Tipo de Vehículo
                      </label>
                      <select
                        value={item.vehicleType}
                        onChange={(e) => handleUpdateField(item.id, 'vehicleType', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-blue-700 bg-white"
                      >
                        {VEHICLE_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Commercial Value */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Valor Póliza ($ COP)
                      </label>
                      <input
                        type="number"
                        placeholder="Ej: 685000"
                        value={item.transactionValue}
                        onChange={(e) => handleUpdateField(item.id, 'transactionValue', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-blue-700 bg-white"
                      />
                    </div>
                  </div>

                  {/* Client name optional */}
                  <div className="pt-0.5">
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Tomador / Propietario (Opcional):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Alejandro Morales"
                      value={item.clientName}
                      onChange={(e) => handleUpdateField(item.id, 'clientName', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:border-blue-700"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Button: Add More SOATs */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddSoat}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100/60 text-blue-900 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:border-blue-400"
              >
                <Plus className="w-4 h-4 text-blue-700" />
                <span>+ Agregar otro SOAT a esta comprobación</span>
              </button>
            </div>

            {/* Summary Banner */}
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
                  <CoinIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-300 block">Total a Comprobar:</span>
                  <span className="text-sm font-black text-white">
                    {soatList.length} SOAT{soatList.length > 1 ? 's únicos' : ' único'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-blue-300 block font-medium">Recompensa estimada:</span>
                <span className="text-base font-black text-blue-400">
                  +{totalExpectedPoints} pts
                </span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
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
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white shadow-md shadow-blue-950/30 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
              >
                <SendHorizontal className="w-4 h-4" />
                <span>
                  {isSubmitting 
                    ? 'Enviando comprobación...' 
                    : `Enviar ${soatList.length} SOAT${soatList.length > 1 ? 's' : ''} a Comprobar`}
                </span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
