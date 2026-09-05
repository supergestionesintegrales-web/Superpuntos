import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  KeyRound, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTempPassword?: (identifier: string, tempPassword: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onUseTempPassword
}) => {
  const { requestPasswordReset } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Success dispatch state
  const [resetData, setResetData] = useState<{
    tempPassword: string;
    expiresAt: string;
    sentEmail: string;
    userName: string;
    documentId: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGoogleAccount(false);

    const clean = identifier.trim();
    if (!clean) {
      setError('Por favor ingresa tu correo electrónico o número de cédula.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(clean);
      if (res.success && res.tempPassword && res.expiresAt && res.user) {
        setResetData({
          tempPassword: res.tempPassword,
          expiresAt: res.expiresAt,
          sentEmail: res.sentEmail || res.user.email,
          userName: res.user.name,
          documentId: res.user.documentId
        });
      } else {
        if (res.isGoogleUser) {
          setIsGoogleAccount(true);
        }
        setError(res.message);
      }
    } catch {
      setError('Ocurrió un error al procesar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (resetData?.tempPassword) {
      navigator.clipboard.writeText(resetData.tempPassword);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 3000);
    }
  };

  const handleContinueToLogin = () => {
    if (resetData && onUseTempPassword) {
      onUseTempPassword(resetData.documentId || resetData.sentEmail, resetData.tempPassword);
    }
    handleClose();
  };

  const handleClose = () => {
    setIdentifier('');
    setError(null);
    setResetData(null);
    setIsGoogleAccount(false);
    onClose();
  };

  const formatExpiryTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) + ' del ' + date.toLocaleDateString('es-CO', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch {
      return 'en 5 horas';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                Recuperación Segura
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                ¿Olvidaste tu contraseña?
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            El sistema generará una <strong>contraseña temporal válida por 5 horas</strong> para que puedas acceder y configurar tu contraseña definitiva.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {!resetData ? (
            /* Form view */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico o Número de Cédula
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError(null);
                    }}
                    placeholder="ej. aliado@supergiros.com o 1098765432"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden text-sm transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ingresa los mismos datos con los que te registraste en el programa.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Atención</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Google Account Info Box */}
              {isGoogleAccount && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Cuenta de Google detectada</strong>
                    <span>Tu cuenta está vinculada a Google. Puedes cerrar esta ventana y dar clic en "Continuar con Google".</span>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generando clave temporal...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Enviar Contraseña Temporal (5 horas)</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          ) : (
            /* Success / Simulated Email Dispatched Card */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-950 text-sm">
                    ¡Correo de Recuperación Enviado!
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Hemos emitido la contraseña temporal de 5 horas a nombre de <strong>{resetData.userName}</strong>.
                  </p>
                </div>
              </div>

              {/* Simulated Email Box */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-slate-700">Para: {resetData.sentEmail}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Válida por 5 horas
                  </span>
                </div>

                <div className="text-center py-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Tu Contraseña Temporal
                  </span>
                  <div className="text-2xl font-black text-amber-600 tracking-wider font-mono my-1 selection:bg-amber-100">
                    {resetData.tempPassword}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{hasCopied ? '¡Copiada!' : 'Copiar Contraseña'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span><strong>Vigencia:</strong> Expira a las {formatExpiryTime(resetData.expiresAt)}.</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Al iniciar sesión con esta clave temporal, el sistema te solicitará definir tu <strong>contraseña definitiva</strong>.</span>
                  </p>
                </div>
              </div>

              {/* Action button */}
              <button
                type="button"
                onClick={handleContinueToLogin}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Ir al Inicio de Sesión con esta Clave</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
