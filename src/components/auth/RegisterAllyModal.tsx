import React, { useState } from 'react';
import { 
  UserPlus, 
  X, 
  Sparkles, 
  Store, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Coins,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface RegisterAllyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterAllyModal: React.FC<RegisterAllyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { registerAlly, triggerConfetti, users } = useApp();

  const [name, setName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !documentId.trim() || !email.trim()) {
      setError('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    if (!businessName.trim()) {
      setError('Por favor indica a qué Empresa o Aliado Comercial perteneces (campo obligatorio).');
      return;
    }

    if (!password) {
      setError('La contraseña de acceso es obligatoria.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    // Check if document already exists
    const existing = users.find(u => u.documentId.trim() === documentId.trim());
    if (existing) {
      setError('Ya existe un aliado registrado con este número de cédula o documento.');
      return;
    }

    registerAlly({
      name: name.trim(),
      documentId: documentId.trim(),
      businessName: businessName.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || '300 000 0000',
      password
    });

    triggerConfetti();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-inner font-black">
              <UserPlus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                Nuevo Aliado
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Registro en Superpuntos
              </h2>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">¡Cuenta Creada Exitosamente!</h3>
            <p className="text-xs text-slate-500">
              Iniciando sesión con <strong>0 Superpuntos</strong>. ¡Comienza a reportar tus ventas de SOAT para acumular puntos!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nombre Completo del Aliado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Sofía Martínez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Número de Cédula (Documento) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 1098765432"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Empresa o Aliado Comercial *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ej: SuperGIROS La Estación, Droguería Central..."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700"
                  />
                  <Store className="w-3.5 h-3.5 text-blue-900 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-slate-400">Punto de venta, razón social o entidad a la que perteneces</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: 315 889 0012"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Correo Electrónico *</label>
              <input
                type="email"
                required
                placeholder="aliado@supergestiones.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700"
              />
            </div>

            {/* Password and Password Confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Contraseña de Acceso *</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Ocultar' : 'Ver'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700 pr-8"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Confirmar Contraseña *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden pr-8 ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-red-400 focus:border-red-500 bg-red-50/20' 
                        : confirmPassword && password === confirmPassword
                        ? 'border-emerald-400 focus:border-emerald-500 bg-emerald-50/20'
                        : 'border-slate-200 focus:border-blue-700'
                    }`}
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200/80 text-xs text-blue-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-800 shrink-0" />
              <span>
                El aliado inicia con saldo <strong>0 Superpuntos</strong> y nivel <strong>Bronce</strong>.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs shadow-md shadow-blue-950/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Completar Registro e Ingresar</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
