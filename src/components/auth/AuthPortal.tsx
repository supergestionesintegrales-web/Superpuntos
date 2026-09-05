import React, { useState } from 'react';
import { 
  Coins, 
  ShieldCheck, 
  Store, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  LogIn, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  Phone, 
  Mail, 
  Eye, 
  EyeOff, 
  Database,
  Building2,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface AuthPortalProps {
  onOpenRegisterAlly?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = () => {
  const { 
    users, 
    loginAsAlly, 
    loginAsAdmin, 
    loginWithGoogle,
    registerAlly, 
    registerWithEmailPassword,
    triggerConfetti,
    isGoogleConnected,
    isFirebaseConnected,
    firestoreStatus
  } = useApp();

  // Active Tab: 'ally_login' | 'ally_register' | 'admin_login'
  const [activeTab, setActiveTab] = useState<'ally_login' | 'ally_register' | 'admin_login'>('ally_login');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Google Login loading state & Unauthorized Domain Guide
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [hasCopiedDomain, setHasCopiedDomain] = useState(false);

  const copyDomainToClipboard = (domain: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(domain);
      setHasCopiedDomain(true);
      setTimeout(() => setHasCopiedDomain(false), 3000);
    }
  };

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

  // Ally Registration Form State (Clean)
  const [regName, setRegName] = useState('');
  const [regDocument, setRegDocument] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Admin Login Form State (Clean - No pre-filled passwords or credentials)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

  // Sync state


  // Handle Ally Login Submit
  const handleAllySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAllyError(null);

    const cleanDoc = allyDocument.trim();
    if (!cleanDoc) {
      setAllyError({ message: 'Por favor ingresa tu número de cédula o documento de identidad.' });
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

  // Handle Google Sign-In with Firebase Auth
  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setAllyError(null);
    setRegError(null);
    setUnauthorizedDomain(null);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        if (res.code === 'auth/unauthorized-domain' || res.message?.includes('unauthorized-domain')) {
          setUnauthorizedDomain(res.domain || (typeof window !== 'undefined' ? window.location.hostname : ''));
        } else {
          if (activeTab === 'admin_login') {
            setAdminError(res.message);
          } else {
            setAllyError({ message: res.message });
          }
        }
      } else {
        triggerConfetti();
      }
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setUnauthorizedDomain(typeof window !== 'undefined' ? window.location.hostname : '');
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Error al conectar con Google';
        if (activeTab === 'admin_login') {
          setAdminError(errorMsg);
        } else {
          setAllyError({ message: errorMsg });
        }
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  // Switch to register tab pre-filling document
  const handleGoToRegisterWithDoc = () => {
    setRegDocument(allyDocument.trim());
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
      // Register with Firebase Auth and sync with Firestore
      const res = await registerWithEmailPassword({
        name: regName.trim(),
        documentId: regDocument.trim(),
        businessName: regBusinessName.trim() || undefined,
        email: regEmail.trim(),
        phone: regPhone.trim() || '300 000 0000',
        password: regPassword
      });

      if (!res.success) {
        setRegError(res.message);
        setIsRegistering(false);
        return;
      }

      triggerConfetti();
      setRegSuccess(true);

      setTimeout(async () => {
        await loginAsAlly(regDocument.trim(), regPassword);
      }, 1200);
    } catch {
      setRegError('Hubo un problema al registrar la cuenta en Firebase. Intenta de nuevo.');
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-900 font-sans text-slate-100 relative overflow-hidden">
      
      {/* Background Subtle Gradient Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-800/30 rounded-full pointer-events-none"></div>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <Coins className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-white tracking-tight">
                SUPER<span className="text-amber-500">PUNTOS</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Portal de Fidelización
              </span>
            </div>
            <span className="text-xs text-slate-400 block -mt-0.5">
              Red de Aliados Comerciales SuperGIROS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Conexión Segura
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col justify-center">
        
        {/* Header Title */}
        <div className="text-center mb-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Acceso al Portal de Recompensas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            El sistema valida tus credenciales de forma segura.
          </p>
        </div>

        {/* Clean Segmented Tab Switcher */}
        <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mb-6 grid grid-cols-3 gap-1 shadow-md">
          <button
            onClick={() => {
              setActiveTab('ally_login');
              setAllyError(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ally_login'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            <span>Ingreso Aliado</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ally_register');
              setRegError(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ally_register'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Registrarse</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admin_login');
              setAdminError(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'admin_login'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Administrador</span>
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all space-y-6">
          
          {/* Banner de Solución para Dominio no Autorizado en Firebase */}
          {unauthorizedDomain && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs space-y-3.5 animate-in fade-in shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Dominio no autorizado en Firebase Auth</h4>
                    <p className="text-amber-300/90 text-xs mt-0.5">
                      Firebase bloquea el acceso con Google hasta que autorices este dominio en la consola de Firebase.
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setUnauthorizedDomain(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
                  title="Cerrar aviso"
                >
                  ✕
                </button>
              </div>

              {/* Dominio a copiar */}
              <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Dominio que debes agregar:</span>
                  <code className="text-amber-300 font-mono text-xs select-all break-all">{unauthorizedDomain}</code>
                </div>
                <button
                  type="button"
                  onClick={() => copyDomainToClipboard(unauthorizedDomain)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  {hasCopiedDomain ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instrucciones paso a paso */}
              <div className="space-y-1.5 text-slate-300 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <p className="font-bold text-white text-[11px] uppercase tracking-wider">Pasos para autorizarlo (toma 30 segundos):</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-xs pl-1">
                  <li>Abre la consola del proyecto <strong className="text-white">superpuntos-on</strong>.</li>
                  <li>Ve a <strong className="text-white">Authentication &gt; Settings</strong> (pestaña Configuración).</li>
                  <li>Baja hasta <strong className="text-white">"Authorized domains"</strong> (Dominios autorizados).</li>
                  <li>Haz clic en <strong className="text-amber-400">"Add domain"</strong>, pega el dominio copiado y guarda.</li>
                </ol>
              </div>

              {/* Botón directo a Firebase Console */}
              <div className="pt-1 flex flex-wrap gap-2">
                <a
                  href="https://console.firebase.google.com/project/superpuntos-on/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Abrir Configuración en Firebase Console ↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => setUnauthorizedDomain(null)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Entendido, cerrar
                </button>
              </div>
            </div>
          )}
          
          {/* ================= VIEW 1: INGRESO ALIADO ================= */}
          {activeTab === 'ally_login' && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-amber-500" />
                  Iniciar Sesión como Aliado Comercial
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ingresa tu cédula y contraseña registrada en el sistema.
                </p>
              </div>

              {/* Error Alert with Registration Redirect */}
              {allyError && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs animate-in fade-in slide-in-from-top-2 ${
                  allyError.notRegistered 
                    ? 'bg-amber-950/70 border-amber-500/40 text-amber-200' 
                    : 'bg-red-950/70 border-red-500/40 text-red-200'
                }`}>
                  <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${allyError.notRegistered ? 'text-amber-400' : 'text-red-400'}`} />
                  <div className="flex-1 space-y-2.5">
                    <p className="font-semibold leading-relaxed">
                      {allyError.message}
                    </p>
                    {allyError.notRegistered && (
                      <button
                        type="button"
                        onClick={handleGoToRegisterWithDoc}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Crear mi cuenta de Aliado con esta cédula →</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Banner de Reconocimiento de Cuenta */}
              {recognizedName && allyDocument && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="font-bold text-white">¡Hola de nuevo, {recognizedName}!</p>
                      <p className="text-[11px] text-amber-300/80">Cuenta reconocida en el sistema ({allyDocument})</p>
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

              {/* Form de Ingreso Aliado */}
              <form onSubmit={handleAllySubmit} className="space-y-4">
                
                {/* Document Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Cédula / Documento de Identidad <span className="text-amber-400 font-bold">*</span>
                  </label>
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
                    placeholder="Ingresa tu número de documento"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Contraseña <span className="text-amber-400 font-bold">*</span>
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
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
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

                {/* Submit Button: Iniciar Sesión justo debajo de Cédula y Contraseña */}
                <button
                  id="btn-iniciar-sesion-aliado"
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-4 px-6 rounded-xl font-black text-base bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-3"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Validando en base de datos...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 stroke-[2.5]" />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </button>

              </form>

              {/* Forgot Password Link */}
              <div className="text-center pt-1">
                <button
                  id="btn-olvido-contrasena"
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs text-slate-400 hover:text-amber-400 hover:underline transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Google Sign-In con separador limpio y legible */}
              <div className="pt-2">
                <div className="flex items-center gap-3 my-4">
                  <div className="h-px bg-slate-800 flex-1"></div>
                  <span className="text-xs text-slate-400 font-medium select-none px-2">
                    o ingresa con tu cuenta
                  </span>
                  <div className="h-px bg-slate-800 flex-1"></div>
                </div>

                <button
                  id="btn-google-sign-in"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSigningIn}
                  className="w-full py-3.5 px-4 rounded-xl border border-slate-700/80 bg-slate-950/90 hover:bg-slate-800 text-sm font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isGoogleSigningIn ? 'Conectando con Google...' : 'Ingresar con Google'}</span>
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
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline ml-1 cursor-pointer"
                >
                  Regístrate aquí
                </button>
              </div>

            </div>
          )}

          {/* ================= VIEW 2: REGISTRO ALIADO ================= */}
          {activeTab === 'ally_register' && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-500" />
                  Registro de Nuevo Aliado Comercial
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Diligencia tus datos. Al registrarte quedarás guardado en la base de datos del sistema.
                </p>
              </div>

              {regSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block">¡Registro Exitoso!</span>
                    <span>Tu cuenta fue creada e ingresada a la base de datos. Iniciando sesión...</span>
                  </div>
                </div>
              )}

              {regError && (
                <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Quick Google Sign-In */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSigningIn}
                  className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-950/80 hover:bg-slate-800 text-sm font-bold text-white transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isGoogleSigningIn ? 'Conectando con Google...' : 'Registrarme con Google'}</span>
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="h-px bg-slate-800 flex-1"></div>
                  <span className="text-xs text-slate-400 font-medium select-none px-2">
                    o completa el formulario de registro
                  </span>
                  <div className="h-px bg-slate-800 flex-1"></div>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Nombre Completo / Razón Social <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ej: Carlos Gómez"
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                {/* Grid 2 Cols: Document & Business Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Cédula / NIT <span className="text-amber-400 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regDocument}
                      onChange={(e) => setRegDocument(e.target.value)}
                      placeholder="Ej: 1098765432"
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Punto de Venta / Negocio
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={regBusinessName}
                        onChange={(e) => setRegBusinessName(e.target.value)}
                        placeholder="Ej: Variedades El Centro"
                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                      <Building2 className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Grid 2 Cols: Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Correo Electrónico <span className="text-amber-400 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="aliado@correo.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Teléfono / WhatsApp
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="300 123 4567"
                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                      <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Grid 2 Cols: Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Contraseña <span className="text-amber-400 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
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
                      Confirmar Contraseña <span className="text-amber-400 font-bold">*</span>
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering || regSuccess}
                  className="w-full py-4 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
                >
                  {isRegistering ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Registrando cuenta en la base de datos...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Registrarme y Acceder</span>
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
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline ml-1 cursor-pointer"
                >
                  Inicia sesión aquí
                </button>
              </div>

            </div>
          )}

          {/* ================= VIEW 3: ACCESO ADMINISTRADOR ================= */}
          {activeTab === 'admin_login' && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
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

              {/* Botón de Ingreso con Google para el Dueño/Administrador */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSigningIn}
                  className="w-full py-3.5 px-4 rounded-xl border border-slate-700 bg-slate-950/80 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs group"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isGoogleSigningIn ? 'Conectando con Google...' : 'Ingresar como Administrador con Google'}</span>
                </button>

                <div className="flex items-center gap-3 my-3">
                  <div className="h-px bg-slate-800 flex-1"></div>
                  <span className="text-xs text-slate-400 font-medium select-none px-2">
                    o con usuario administrativo y contraseña
                  </span>
                  <div className="h-px bg-slate-800 flex-1"></div>
                </div>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Usuario / Correo Administrativo <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Ingresa tu correo o usuario administrativo"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Contraseña de Administrador <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
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
                  className="w-full py-4 px-6 rounded-xl font-black text-sm bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
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
                  className="text-xs text-slate-400 hover:text-amber-400 hover:underline transition-colors cursor-pointer"
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
