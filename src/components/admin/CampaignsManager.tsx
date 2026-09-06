import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Trash2, 
  Info, 
  Car, 
  Bike, 
  Gamepad2, 
  SendHorizontal, 
  ShieldCheck, 
  BadgePercent, 
  Smartphone,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Campaign } from '../../types';
import { formatPoints, formatCurrency, formatDate } from '../../utils/helpers';
import { CampaignIcon } from '../common/CampaignIcon';

const AVAILABLE_ICONS = [
  { name: 'Car', label: 'Carro / SOAT' },
  { name: 'Bike', label: 'Moto / Movilidad' },
  { name: 'Gamepad2', label: 'Juegos / Betplay' },
  { name: 'SendHorizontal', label: 'Giros / Envíos' },
  { name: 'ShieldCheck', label: 'Seguros / Pólizas' },
  { name: 'BadgePercent', label: 'Créditos / Finanzas' },
  { name: 'Smartphone', label: 'Telefonía / Recargas' },
  { name: 'Sparkles', label: 'Especial / Bonos' }
];

interface CampaignsManagerProps {
  isModalOpenExternal?: boolean;
  onCloseExternalModal?: () => void;
}

export const CampaignsManager: React.FC<CampaignsManagerProps> = ({
  isModalOpenExternal,
  onCloseExternalModal
}) => {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(isModalOpenExternal || false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    serviceType: '',
    categoryTag: 'Seguros y Asistencias',
    pointsAwarded: 500,
    calculationType: 'fixed' as 'fixed' | 'per_unit' | 'percentage',
    minAmount: 0,
    rulesDescription: '',
    iconName: 'Car',
    active: true
  });

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    setFormData({
      serviceType: '',
      categoryTag: 'Seguros y Asistencias',
      pointsAwarded: 500,
      calculationType: 'fixed',
      minAmount: 0,
      rulesDescription: 'Expedición validada en RUNT / Sistema de aseguradora.',
      iconName: 'Car',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      serviceType: campaign.serviceType,
      categoryTag: campaign.categoryTag,
      pointsAwarded: campaign.pointsAwarded,
      calculationType: campaign.calculationType,
      minAmount: campaign.minAmount || 0,
      rulesDescription: campaign.rulesDescription,
      iconName: campaign.iconName,
      active: campaign.active
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
    if (onCloseExternalModal) onCloseExternalModal();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCampaign) {
      updateCampaign(editingCampaign.id, {
        serviceType: formData.serviceType,
        categoryTag: formData.categoryTag,
        pointsAwarded: formData.pointsAwarded,
        calculationType: formData.calculationType,
        minAmount: formData.minAmount > 0 ? formData.minAmount : undefined,
        rulesDescription: formData.rulesDescription,
        iconName: formData.iconName,
        active: formData.active
      });
    } else {
      addCampaign({
        serviceType: formData.serviceType,
        categoryTag: formData.categoryTag,
        pointsAwarded: formData.pointsAwarded,
        calculationType: formData.calculationType,
        minAmount: formData.minAmount > 0 ? formData.minAmount : undefined,
        rulesDescription: formData.rulesDescription,
        iconName: formData.iconName,
        active: formData.active
      });
    }

    handleClose();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la campaña "${name}"?`)) {
      deleteCampaign(id);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Reglas de Fidelización & Puntuación
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Campañas Comerciales y Servicios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configura los servicios que otorgan Superpuntos a tus aliados y define las condiciones de validación.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Campaña Comercial</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {campaigns.map(camp => {
          return (
            <div
              key={camp.id}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                camp.active ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="space-y-3">
                
                {/* Top Row: Icon + Category Badge + Active pill */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 text-blue-900 flex items-center justify-center shadow-xs">
                    <CampaignIcon name={camp.iconName} className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {camp.categoryTag}
                    </span>

                    {camp.active ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Activa
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        Inactiva
                      </span>
                    )}
                  </div>
                </div>

                {/* Service Name & Points Awarded */}
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">
                    {camp.serviceType}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-1 font-black text-xl text-blue-900">
                    <Coins className="w-4 h-4 text-blue-900 self-center" />
                    <span>+{formatPoints(camp.pointsAwarded)}</span>
                    <span className="text-xs font-bold text-slate-500">
                      {camp.calculationType === 'per_unit' && camp.minAmount
                        ? `pts por cada ${formatCurrency(camp.minAmount)}`
                        : 'pts por gestión'}
                    </span>
                  </div>
                </div>

                {/* Rules description */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="line-clamp-2">{camp.rulesDescription}</p>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {camp.calculationType === 'fixed' ? 'Puntos fijos' : 'Proporcional'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(camp)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Editar campaña"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(camp.id, camp.serviceType)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors cursor-pointer"
                    title="Eliminar campaña"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Campaign Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    {editingCampaign ? 'Modificar Regla' : 'Nueva Campaña'}
                  </span>
                  <h2 className="text-xl font-bold mt-0.5">
                    {editingCampaign ? `Editar: ${editingCampaign.serviceType}` : 'Crear Campaña Comercial'}
                  </h2>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nombre del Servicio / Campaña *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: SOAT Automóvil Particular"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Categoría Comercial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Seguros y Asistencias, Apuestas..."
                    value={formData.categoryTag}
                    onChange={(e) => setFormData({ ...formData, categoryTag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Ícono Representativo</label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-slate-50"
                  >
                    {AVAILABLE_ICONS.map(i => (
                      <option key={i.name} value={i.name}>{i.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Puntos a Otorgar *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.pointsAwarded}
                    onChange={(e) => setFormData({ ...formData, pointsAwarded: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-blue-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tipo de Cálculo</label>
                  <select
                    value={formData.calculationType}
                    onChange={(e) => setFormData({ ...formData, calculationType: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500 bg-slate-50"
                  >
                    <option value="fixed">Puntos fijos por transacción</option>
                    <option value="per_unit">Por cada $X pesos transados</option>
                  </select>
                </div>
              </div>

              {formData.calculationType === 'per_unit' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Monto Base por Unidad ($ COP)</label>
                  <input
                    type="number"
                    placeholder="Ej: 50000 (para otorgar puntos por cada $50.000)"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Rules text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Reglas y Criterios de Aprobación *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ej: La póliza debe estar expedida y verificada con número de serie..."
                  value={formData.rulesDescription}
                  onChange={(e) => setFormData({ ...formData, rulesDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Campaña Comercial Activa (Visible para Aliados)</span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingCampaign ? 'Actualizar Campaña' : 'Publicar Campaña'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
