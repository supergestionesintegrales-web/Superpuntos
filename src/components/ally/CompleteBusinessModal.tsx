import React, { useState } from 'react';
import { Store, Building2, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CompleteBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompleteBusinessModal: React.FC<CompleteBusinessModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, updateUser, triggerConfetti } = useApp();
  const [businessName, setBusinessName] = useState(
    currentUser?.businessName && currentUser.businessName.toLowerCase() !== 'momently correo' && currentUser.businessName !== currentUser?.name
      ? currentUser.businessName
      : ''
  );
  const [zone, setZone] = useState(currentUser?.zone || '');
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !currentUser || currentUser.role !== 'ally') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim()) {
      setError('Por favor escribe el nombre de la Empresa o Aliado Comercial al que perteneces.');
      return;
    }

    updateUser({
      ...currentUser,
      businessName: businessName.trim(),
      zone: zone.trim() || currentUser.zone || 'Principal'
    });

    triggerConfetti();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div 
      id="complete-business-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        id="complete-business-modal-content"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top visual header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-inner">
            <Store className="w-6 h-6 text-blue-300" />
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            Identificación de Aliado Comercial
          </h2>
          <p className="text-xs text-blue-200/90 mt-1 leading-relaxed">
            Para identificarte correctamente en la <span className="font-bold text-white">Red de Aliados</span> de Superpuntos, indica a qué Empresa o Aliado perteneces.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSaved ? (
            <div className="text-center py-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm">¡Empresa registrada exitosamente!</p>
              <p className="text-xs text-slate-500">Tus datos ahora se sincronizan con la Red de Aliados en Firebase.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Empresa o Aliado Comercial al que perteneces <span className="text-blue-900">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ej: SuperGIROS La Estación, Droguería Central..."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                  />
                  <Store className="w-4 h-4 text-blue-900 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Este es el nombre con el que aparecerás registrado en la Red de Aliados.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Ciudad o Zona (Opcional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: Cali Centro, Palmira, Yumbo..."
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Guardar e Identificarme</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
