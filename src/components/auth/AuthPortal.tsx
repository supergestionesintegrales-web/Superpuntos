import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Store, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  LogIn, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  Mail, 
  Eye, 
  EyeOff, 
  Database,
  Building2,
  RefreshCw,
  KeyRound,
  CreditCard,
  Copy,
  Check,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CoinIcon } from '../common/CoinIcon';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { generateAcronymicEmail } from '../../utils/helpers';

interface AuthPortalProps {
  onOpenRegisterAlly?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = () => {
  const { 
    users, 
    loginAsAlly, 
    loginAsAdmin, 
    registerAlly, 
    registerWithEmailPassword,
    triggerConfetti,
    isFirebaseConnected,
    firestoreStatus
  } = useApp();

  // Active Tab: 'ally_login' | 'ally_register' | 'admin_login'
  const [activeTab, setActiveTab] = useState<'ally_login' | 'ally_register' | 'admin_login'>('ally_login');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Ally Login Form State (With remembered account recognition)
  const [allyDocument, setAllyDocument] = useState(() => {
    try {
      return localStorage.getItem('superpuntos_last_logged_doc') || '';
    } catch {
      return '';
    }
  });
  const [recognizedName, setRecognizedName] = useState(() => {
    try {
      return localStorage.getItem('superpuntos_last_logged_name') || '';
    } catch {
      return '';
    }
  });
  const [allyPassword, setAllyPassword] = useState('');
  const [showAllyPassword, setShowAllyPassword] = useState(false);
  const [allyError, setAllyError] = useState<{ message: string; notRegistered?: boolean } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Ally Registration Form State (Clean - No phone required)
  const [regName, setRegName] = useState('');
  const [regDocument, setRegDocument] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredAllyData, setRegisteredAllyData] = useState<{
    name: string;
    documentId: string;
    businessName: string;
    personalEmail: string;
    systemEmail: string;
  } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Admin Login Form State (Clean - No pre-filled passwords or credentials)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

  // Sync state


  // Helper to format raw Firebase Auth errors into friendly messages
  const formatAuthError = (msg?: string) => {
    if (!msg) return 'Ocurrió un error inesperado al procesar la solicitud.';
    if (msg.includes('internal-error')) {
      return 'Restricción temporal del servicio de autenticación de la base de datos. Puedes ingresar con tu documento y contraseña.';
    }
    if (msg.includes('invalid-verification-code')) {
      return 'Código SMS de verificación incorrecto. Por favor revísalo e intenta de nuevo.';
    }
    return msg;
  };

  // Handle Ally Login Submit
  const handleAllySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAllyError(null);

    const cleanDoc = allyDocument.trim();
    if (!cleanDoc) {
      setAllyError({ message: 'Por favor ingresa tu correo electrónico o documento registrado.' });
      return;
    }

    if (!allyPassword) {
      setAllyError({ message: 'Por favor ingresa tu contraseña de acceso.' });
      return;
    }

    setIsVerifying(true);
    try {
      const res = await loginAsAlly(cleanDoc, allyPassword);
      if (!res.success) {
        setAllyError({ 
          message: res.message, 
          notRegistered: res.notRegistered 
        });
      }
    } catch {
      setAllyError({ message: 'Ocurrió un error al validar tus credenciales en la base de datos. Inténtalo de nuevo.' });
    } finally {
      setIsVerifying(false);
    }
  };

  // Switch to register tab pre-filling email or document
  const handleGoToRegisterWithDoc = () => {
    const val = allyDocument.trim();
    if (val.includes('@')) {
      setRegEmail(val);
    } else {
      setRegDocument(val);
    }
    setAllyError(null);
    setActiveTab('ally_register');
  };

  // Handle Ally Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regDocument.trim() || !regEmail.trim()) {
      setRegError('Por favor completa todos los campos requeridos (*).');
      return;
    }

    if (!regBusinessName.trim()) {
      setRegError('Por favor indica a qué Empresa o Aliado Comercial perteneces (campo obligatorio para identificarte en el programa).');
      return;
    }

    if (!regPassword) {
      setRegError('La contraseña de acceso es obligatoria (*).');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    // Check if document already exists
    const existing = users.find(u => u.documentId.trim().toLowerCase() === regDocument.trim().toLowerCase());
    if (existing) {
      setRegError('Ya existe un usuario registrado con este número de documento. Puedes iniciar sesión con tus credenciales.');
      return;
    }

    setIsRegistering(true);
    try {
      // Register new ally request with acronymic institutional email
      const res = await registerWithEmailPassword({
        name: regName.trim(),
        documentId: regDocument.trim(),
        businessName: regBusinessName.trim() || undefined,
        email: regEmail.trim(),
        phone: '',
        password: regPassword
      });

      if (!res.success) {
        setRegError(res.message);
        setIsRegistering(false);
        return;
      }

      triggerConfetti();
      const generatedEmail = res.user?.systemEmail || generateAcronymicEmail(regName.trim(), regDocument.trim(), regBusinessName.trim());
      setRegisteredAllyData({
        name: regName.trim(),
        documentId: regDocument.trim(),
        businessName: regBusinessName.trim(),
        personalEmail: regEmail.trim(),
        systemEmail: generatedEmail
      });
      setRegSuccess(true);
      // Clear sensitive password inputs
      setRegPassword('');
      setRegConfirmPassword('');
    } catch {
      setRegError('Hubo un problema al procesar la solicitud de registro. Intenta de nuevo.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Admin Login Submit
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!adminEmail.trim()) {
      setAdminError('Ingresa el correo o usuario administrativo.');
      return;
    }

    if (!adminPassword) {
      setAdminError('Ingresa la contraseña de administrador.');
      return;
    }

    setIsAdminLoggingIn(true);
    setTimeout(() => {
      const res = loginAsAdmin(adminEmail, adminPassword);
      if (!res.success) {
        setAdminError(res.message);
        setIsAdminLoggingIn(false);
      }
    }, 300);
  };


  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-blue-900 selection:text-white font-sans text-slate-100 relative overflow-hidden">
      
      {/* Background Subtle Gradient Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-900/25 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-800/30 rounded-full pointer-events-none"></div>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-950 text-white flex items-center justify-center font-black shadow-lg shadow-blue-900/30 overflow-hidden border border-blue-600/40">
            <img src="/favicon.svg" alt="Superpuntos Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-white tracking-tight">
                SUPER<span className="text-blue-400">PUNTOS</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold tracking-widest text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
                Portal de Superpuntos
              </span>
            </div>
            <span className="text-xs text-slate-400 block -mt-0.5">
              Red de Aliados Comerciales SuperGIROS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Conexión Segura
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col justify-center">
        
        {/* Header Title */}
        <div className="text-center mb-6 space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-br from-blue-700 to-slate-900 border border-blue-500/40 shadow-xl shadow-blue-900/50 flex items-center justify-center">
              <img src="/favicon.svg" alt="Superpuntos Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bienvenido - Portal de Superpuntos
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
              Acceso seguro al sistema de recompensas y fidelización SuperGIROS
            </p>
          </div>
        </div>

        {/* Clean Segmented Tab Switcher */}
        <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mb-6 grid grid-cols-3 gap-1 shadow-md">
          <button
            onClick={() => {
              setActiveTab('ally_login');
              setAllyError(null);
            }}
            className={`py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeTab === 'ally_login'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Ingreso </span>Aliado
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ally_register');
              setRegError(null);
            }}
            className={`py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeTab === 'ally_register'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Nuevo </span>Registro
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admin_login');
              setAdminError(null);
            }}
            className={`py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeTab === 'admin_login'
                ? 'bg-blue-950 text-blue-300 border border-blue-800 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Portal </span>Admin
            </span>
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all space-y-6">
          
          {/* ================= VIEW 1: INGRESO ALIADO ================= */}
          {activeTab === 'ally_login' && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-blue-400" />
                  Iniciar Sesión como Aliado Comercial
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ingresa con tu correo electrónico registrado y contraseña de la base de datos.
                </p>
              </div>

              {/* Error Alert with Registration / Pending Redirect */}
              {allyError && (
                (() => {
                  const isPending = allyError.message.includes('proceso de activación') || allyError.message.includes('pendiente');
                  return (
                    <div className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs animate-in fade-in slide-in-from-top-2 ${
                      isPending
                        ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                        : allyError.notRegistered 
                        ? 'bg-blue-950/80 border-blue-500/40 text-blue-200' 
                        : 'bg-red-950/70 border-red-500/40 text-red-200'
                    }`}>
                      {isPending ? (
                        <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                      ) : (
                        <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${allyError.notRegistered ? 'text-blue-300' : 'text-red-400'}`} />
                      )}
                      <div className="flex-1 space-y-2.5">
                        {isPending && (
                          <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Activación Pendiente en la Base de Datos
                          </span>
                        )}
                        <p className="font-semibold leading-relaxed">
                          {allyError.message}
                        </p>
                        {allyError.notRegistered && (
                          <button
                            type="button"
                            onClick={handleGoToRegisterWithDoc}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-md cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Crear mi cuenta de Aliado Comercial →</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Banner de Reconocimiento de Cuenta */}
              {recognizedName && allyDocument && (
                <div className="p-3.5 bg-blue-600/15 border border-blue-500/30 rounded-2xl flex items-center justify-between text-xs text-blue-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-300 shrink-0" />
                    <div>
                      <p className="font-bold text-white">¡Hola de nuevo, {recognizedName}!</p>
                      <p className="text-[11px] text-blue-300/80">Cuenta reconocida en el sistema ({allyDocument})</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAllyDocument('');
                      setRecognizedName('');
                      try {
                        localStorage.removeItem('superpuntos_last_logged_doc');
                        localStorage.removeItem('superpuntos_last_logged_name');
                      } catch {}
                    }}
                    className="text-[11px] font-semibold text-slate-400 hover:text-white underline cursor-pointer shrink-0 ml-2"
                  >
                    Otra cuenta
                  </button>
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleAllySubmit} className="space-y-4">
                
                {/* Email / Identifier Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Correo Electrónico <span className="text-blue-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-ally-document"
                      type="text"
                      required
                      autoFocus
                      value={allyDocument}
                      onChange={(e) => {
                        setAllyDocument(e.target.value);
                        if (allyError) setAllyError(null);
                      }}
                      placeholder="ej: tu-correo@ejemplo.com o número de cédula"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Ingresa con tu correo registrado en la base de datos o tu cédula.
                  </p>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Contraseña <span className="text-blue-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-ally-password"
                      type={showAllyPassword ? 'text' : 'password'}
                      required
                      value={allyPassword}
                      onChange={(e) => {
                        setAllyPassword(e.target.value);
                        if (allyError) setAllyError(null);
                      }}
                      placeholder="Ingresa tu contraseña"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAllyPassword(!showAllyPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showAllyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button: Iniciar Sesión justo debajo de Correo y Contraseña */}
                <button
                  id="btn-iniciar-sesion-aliado"
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-4 px-6 rounded-xl font-black text-base bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-3"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Validando en la base de datos...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 stroke-[2.5]" />
                      <span>Iniciar Sesión con Correo y Contraseña</span>
                    </>
                  )}
                </button>

              </form>


              {/* Forgot Password Link */}
              <div className="text-center pt-2">
                <button
                  id="btn-olvido-contrasena"
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs text-slate-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Bottom Registration CTA */}
              <div className="pt-4 border-t border-slate-800 text-center">
                <span className="text-xs text-slate-400">
                  ¿Eres un nuevo aliado y no estás registrado?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRegDocument(allyDocument);
                    setActiveTab('ally_register');
                  }}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline ml-1 cursor-pointer"
                >
                  Regístrate aquí
                </button>
              </div>

            </div>
          )}

          {/* ================= VIEW 2: REGISTRO ALIADO ================= */}
          {activeTab === 'ally_register' && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              {registeredAllyData ? (
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-blue-950/60 to-slate-900 border border-blue-500/40 text-center space-y-4 shadow-xl">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
                    </div>

                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        <Clock className="w-3.5 h-3.5" /> Solicitud Enviada a Red de Aliados
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
                        ¡Muchas gracias por registrarte en Superpuntos!
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                        Tu información ha sido registrada y enviada directamente al administrador en la <strong className="text-white">Red de Aliados</strong>.
                      </p>
                    </div>

                    <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 text-left space-y-3">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-200 leading-relaxed">
                          <strong className="block text-amber-300 font-bold mb-0.5">Activación en la base de datos en curso</strong>
                          El administrador agregará tu cuenta a la <strong>base de datos</strong> para habilitar tu acceso. Muy pronto te enviaremos la información de ingreso.
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-400">Aliado / Nombre:</span>
                          <span className="font-bold text-white">{registeredAllyData.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-400">Empresa o Punto:</span>
                          <span className="font-semibold text-slate-200">{registeredAllyData.businessName}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-400">Documento / Cédula:</span>
                          <span className="font-mono text-slate-200">{registeredAllyData.documentId}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-400">Correo de Contacto:</span>
                          <span className="font-mono text-slate-200">{registeredAllyData.personalEmail}</span>
                        </div>

                        {/* Acronymic System Email */}
                        <div className="mt-3 p-3.5 rounded-xl bg-blue-950/80 border border-blue-500/40">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider block">
                                Correo Institucional Creado Acrónicamente
                              </span>
                              <span className="text-xs sm:text-sm font-mono font-bold text-white break-all">
                                {registeredAllyData.systemEmail}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(registeredAllyData.systemEmail);
                                setCopiedEmail(true);
                                setTimeout(() => setCopiedEmail(false), 2000);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                              title="Copiar correo generado"
                            >
                              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedEmail ? 'Copiado' : 'Copiar'}</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Generado con tus datos + @superpuntos.online para tu perfil institucional.
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                        🔐 <strong className="text-slate-200">Acceso garantizado:</strong> Todos los usuarios registrados en la base de datos tienen acceso completo al sistema mediante su correo y contraseña.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAllyDocument(registeredAllyData.systemEmail);
                        setRegisteredAllyData(null);
                        setActiveTab('ally_login');
                      }}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <span>Entendido — Volver al Inicio de Sesión</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-blue-400" />
                      Registro de Nuevo Aliado Comercial
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Diligencia tus datos. Al registrarte tu solicitud será enviada al administrador para habilitar tu acceso en la base de datos.
                    </p>
                  </div>

                  {regError && (
                    <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-3 animate-in fade-in">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* Standard Registration Form */}
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                          Nombre Completo / Razón Social <span className="text-blue-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Ej: Carlos Gómez"
                          className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      {/* Grid 2 Cols: Document & Business Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                            Cédula / NIT <span className="text-blue-400 font-bold">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={regDocument}
                            onChange={(e) => setRegDocument(e.target.value)}
                            placeholder="Ej: 1098765432"
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                            Empresa o Aliado Comercial <span className="text-blue-400 font-bold">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={regBusinessName}
                              onChange={(e) => setRegBusinessName(e.target.value)}
                              placeholder="Ej: SuperGIROS La Estación, Droguería Central..."
                              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                            <Building2 className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Nombre del punto de venta o razón social de tu empresa</p>
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                          Correo Electrónico de Contacto <span className="text-blue-400 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="aliado@correo.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                          <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      {/* Grid 2 Cols: Passwords */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                            Contraseña <span className="text-blue-400 font-bold">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showRegPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Mínimo 6 caracteres"
                              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                            >
                              {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                            Confirmar Contraseña <span className="text-blue-400 font-bold">*</span>
                          </label>
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full py-4 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
                      >
                        {isRegistering ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Enviando solicitud de registro...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-blue-300" />
                            <span>Enviar Solicitud de Registro</span>
                          </>
                        )}
                      </button>

                    </form>


                  <div className="pt-4 border-t border-slate-800 text-center">
                    <span className="text-xs text-slate-400">
                      ¿Ya tienes cuenta registrada en el sistema?{' '}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('ally_login')}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline ml-1 cursor-pointer"
                    >
                      Inicia sesión aquí
                    </button>
                  </div>
                </>
              )}

            </div>
          )}

          {/* ================= VIEW 3: ACCESO ADMINISTRADOR ================= */}
          {activeTab === 'admin_login' && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  Acceso Administrativo SuperGIROS
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Panel de control de inventarios y auditoría de SOATs.
                </p>
              </div>

              {adminError && (
                <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Usuario / Correo Administrativo Autorizado <span className="text-blue-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Escribir correo"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Contraseña de Administrador <span className="text-blue-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-iniciar-sesion-admin"
                  type="submit"
                  disabled={isAdminLoggingIn}
                  className="w-full py-4 px-6 rounded-xl font-black text-sm bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800 shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
                >
                  {isAdminLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Iniciar Sesión como Administrador</span>
                    </>
                  )}
                </button>

              </form>

              {/* Admin Forgot Password Link */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs text-slate-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña de administrador?
                </button>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* Forgot Password Modal (5-Hour Temporary Password) */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onUseTempPassword={(identifier, tempPassword) => {
          if (activeTab === 'admin_login') {
            setAdminEmail(identifier);
            setAdminPassword(tempPassword);
          } else {
            setActiveTab('ally_login');
            setAllyDocument(identifier);
            setAllyPassword(tempPassword);
          }
        }}
      />

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-900">
        <p>
          © 2026 SuperGIROS • Red de Aliados Superpuntos • Todos los derechos reservados
        </p>
      </footer>

    </div>
  );
};
