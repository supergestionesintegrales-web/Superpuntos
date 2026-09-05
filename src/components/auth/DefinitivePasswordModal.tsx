import React, { useState } from 'react';
import { 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DefinitivePasswordModalProps {
  isOpen: boolean;
}

export const DefinitivePasswordModal: React.FC<DefinitivePasswordModalProps> = ({ isOpen }) => {
  const { currentUser, setDefinitivePassword, logout } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = newPassword.trim();
    if (!clean) {
      setError('Por favor ingresa tu nueva contraseña.');
      return;
    }

    if (clean.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres por seguridad.');
      return;
    }

    if (clean !== confirmPassword.trim()) {
      setError('Las contraseñas no coinciden. Verifica e intenta de nuevo.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await setDefinitivePassword(clean);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Ocurrió un error al guardar tu contraseña definitiva.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                Paso Requerido
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                Establecer Contraseña Definitiva
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Has accedido con una <strong>contraseña temporal de 5 horas</strong>. Por seguridad de tu saldo y puntos, crea tu nueva contraseña definitiva.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">
                  Usuario actual: <strong>{currentUser.name}</strong> ({currentUser.email || currentUser.documentId})
                </span>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nueva Contraseña Definitiva
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden text-sm transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Repite la contraseña"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden text-sm transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando en Firebase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar Contraseña Definitiva</span>
                  </>
                )}
              </button>

              {/* Logout Option */}
              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-rose-600 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar sesión y configurar más tarde</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  ¡Contraseña Definitiva Actualizada!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                  Tu nueva contraseña ha sido guardada en Firebase Firestore. Ya puedes utilizarla en cualquier momento para ingresar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
