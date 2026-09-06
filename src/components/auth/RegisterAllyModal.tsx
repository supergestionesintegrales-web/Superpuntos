import React, { useState } from 'react';
import { 
  UserPlus, 
  X, 
  Sparkles, 
  Store, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CoinIcon } from '../common/CoinIcon';
import type { ConfirmationResult } from 'firebase/auth';

interface RegisterAllyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterAllyModal: React.FC<RegisterAllyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { 
    registerAlly, 
    registerWithPhone,
    sendPhoneCode,
    triggerConfetti, 
    users 
  } = useApp();

  // Registration Mode: 'phone' (SMS) or 'standard' (Document + Password)
  const [regMode, setRegMode] = useState<'phone' | 'standard'>('phone');

  // Common Fields
  const [name, setName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');

  // Standard Form Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone SMS Registration Flow State
  const [phoneForSms, setPhoneForSms] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isVerifyingSms, setIsVerifyingSms] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Handle Send SMS Code for Phone Registration
  const handleSendPhoneSms = async () => {
    setError(null);
    const cleanDigits = phoneForSms.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setError('Por favor ingresa un número de celular válido de 10 dígitos (Ej: 315 889 0012).');
      return;
    }

    setIsSendingSms(true);
    try {
      const res = await sendPhoneCode(phoneForSms, 'recaptcha-reg-modal');
      if (res.success && res.confirmationResult) {
        setConfirmationResult(res.confirmationResult);
        setSmsSent(true);
        if (res.isSimulated && res.simulatedCode) {
          setSmsCode(res.simulatedCode);
        }
      } else {
        setError(res.message || 'Error al enviar código SMS de verificación.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al enviar SMS de verificación telefónica.');
    } finally {
      setIsSendingSms(false);
    }
  };

  // Handle Phone Registration Submit
  const handlePhoneRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!smsSent || !confirmationResult) {
      setError('Por favor solicita primero el código SMS de verificación.');
      return;
    }

    const cleanCode = smsCode.replace(/\D/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      setError('El código SMS de verificación debe ser de 6 dígitos numéricos.');
      return;
    }

    if (!name.trim()) {
      setError('Por favor ingresa tu Nombre Completo o Razón Social.');
      return;
    }

    if (!documentId.trim()) {
      setError('Por favor ingresa tu Número de Cédula o NIT.');
      return;
    }

    if (!businessName.trim()) {
      setError('Por favor indica a qué Empresa o Aliado Comercial perteneces.');
      return;
    }

    // Check if document already exists
    const existing = users.find(u => u.documentId.trim().toLowerCase() === documentId.trim().toLowerCase());
    if (existing) {
      setError('Ya existe un aliado registrado con este número de cédula o documento.');
      return;
    }

    setIsVerifyingSms(true);
    try {
      const res = await registerWithPhone({
        name: name.trim(),
        documentId: documentId.trim(),
        businessName: businessName.trim(),
        phone: phoneForSms.trim(),
        email: email.trim() || undefined,
        confirmationResult,
        code: cleanCode
      });

      if (res.success) {
        triggerConfetti();
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          if (onSuccess) onSuccess();
        }, 1600);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al validar el código SMS o crear la cuenta.');
    } finally {
      setIsVerifyingSms(false);
    }
  };

  // Handle Standard Registration Submit
  const handleStandardSubmit = (e: React.FormEvent) => {
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
    const existing = users.find(u => u.documentId.trim().toLowerCase() === documentId.trim().toLowerCase());
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
        {/* Invisible container for Firebase reCAPTCHA */}
        <div id="recaptcha-reg-modal"></div>

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

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setRegMode('phone');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                regMode === 'phone'
                  ? 'bg-blue-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Con Número de Teléfono (SMS)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRegMode('standard');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                regMode === 'standard'
                  ? 'bg-blue-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Con Cédula y Contraseña</span>
            </button>
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
        ) : regMode === 'phone' ? (
          /* ================= PHONE REGISTRATION FORM ================= */
          <form onSubmit={handlePhoneRegistrationSubmit} className="p-5 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Phone input and Send SMS */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Número de Celular / Teléfono *</span>
                {smsSent && (
                  <button
                    type="button"
                    onClick={() => {
                      setSmsSent(false);
                      setSmsCode('');
                      setConfirmationResult(null);
                    }}
                    className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                  >
                    Cambiar número
                  </button>
                )}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    🇨🇴 +57
                  </span>
                  <input
                    type="tel"
                    required
                    disabled={smsSent || isSendingSms}
                    placeholder="300 123 4567"
                    value={phoneForSms}
                    onChange={(e) => setPhoneForSms(e.target.value)}
                    className="w-full pl-16 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-blue-700 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                {!smsSent && (
                  <button
                    type="button"
                    disabled={isSendingSms || !phoneForSms.trim()}
                    onClick={handleSendPhoneSms}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSendingSms ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-3.5 h-3.5" />
                        <span>Enviar SMS</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Recibirás un mensaje de texto SMS con un código de 6 dígitos mediante Firebase Authentication.
              </p>
            </div>

            {/* Step 2: Once SMS is sent, input verification code and remaining details */}
            {smsSent && (
              <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Código SMS enviado exitosamente al <strong>{phoneForSms}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendPhoneSms}
                    disabled={isSendingSms}
                    className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer ml-2 shrink-0"
                  >
                    Reenviar
                  </button>
                </div>

                {/* Verification Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Código de Verificación SMS (6 dígitos) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-base font-mono text-center tracking-widest font-black text-slate-800 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                {/* Name & Document */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nombre Completo *</label>
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
                    <label className="text-xs font-bold text-slate-700">Cédula o NIT *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 1098765432"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700 font-mono"
                    />
                  </div>
                </div>

                {/* Business & Optional Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Empresa o Aliado Comercial *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: SuperGIROS La Estación"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Correo Electrónico (Opcional)</label>
                    <input
                      type="email"
                      placeholder="aliado@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200/80 text-xs text-blue-900 flex items-center gap-2">
              <CoinIcon className="w-4 h-4 shrink-0" />
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

              {smsSent ? (
                <button
                  type="submit"
                  disabled={isVerifyingSms}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs shadow-md shadow-blue-950/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isVerifyingSms ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando SMS...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-300" />
                      <span>Verificar Código y Registrar</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendPhoneSms}
                  disabled={isSendingSms || !phoneForSms.trim()}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Continuar con SMS</span>
                </button>
              )}
            </div>
          </form>
        ) : (
          /* ================= STANDARD REGISTRATION FORM ================= */
          <form onSubmit={handleStandardSubmit} className="p-5 sm:p-6 space-y-4">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700 font-mono"
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
                    placeholder="Ej: SuperGIROS La Estación..."
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-700 font-mono"
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
              <CoinIcon className="w-4 h-4 shrink-0" />
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
