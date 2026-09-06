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
  Phone, 
  Mail, 
  Eye, 
  EyeOff, 
  Database,
  Building2,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldAlert,
  KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CoinIcon } from '../common/CoinIcon';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import type { ConfirmationResult } from 'firebase/auth';

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
    registerWithPhone,
    sendPhoneCode,
    verifyPhoneAndLogin,
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
  const [directGoogleEmail, setDirectGoogleEmail] = useState('');
  const [isDirectGoogleLoading, setIsDirectGoogleLoading] = useState(false);

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

  // Ally Phone SMS Registration State
  const [regSubMode, setRegSubMode] = useState<'phone' | 'standard'>('phone');
  const [regPhoneSms, setRegPhoneSms] = useState('');
  const [regSmsCode, setRegSmsCode] = useState('');
  const [isRegSendingSms, setIsRegSendingSms] = useState(false);
  const [regSmsSent, setRegSmsSent] = useState(false);
  const [regConfirmationResult, setRegConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isRegVerifyingSms, setIsRegVerifyingSms] = useState(false);

  // Ally Login with Phone SMS State
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms'>('password');
  const [loginPhoneSms, setLoginPhoneSms] = useState('');
  const [loginSmsCode, setLoginSmsCode] = useState('');
  const [isLoginSendingSms, setIsLoginSendingSms] = useState(false);
  const [loginSmsSent, setLoginSmsSent] = useState(false);
  const [loginConfirmationResult, setLoginConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoginVerifyingSms, setIsLoginVerifyingSms] = useState(false);

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
      const preferredRole = activeTab === 'admin_login' ? 'admin' : 'ally';
      const res = await loginWithGoogle(undefined, undefined, preferredRole);
      if (!res.success) {
        if (res.code === 'auth/popup-closed-by-user') {
          // El usuario cerró la ventana de Google voluntariamente, no mostrar error ruidoso
          return;
        }
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
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user') || err?.code === 'auth/cancelled-popup-request') {
        // Usuario cerró o canceló la ventana emergente
        return;
      }
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

  // Direct Google Sign-In for environments without authorized domain yet
  const handleDirectGoogleSignIn = async (emailToUse?: string) => {
    const targetEmail = (emailToUse || directGoogleEmail).trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      if (activeTab === 'admin_login') {
        setAdminError('Por favor ingresa un correo de Google válido.');
      } else {
        setAllyError({ message: 'Por favor ingresa un correo de Google válido.' });
      }
      return;
    }
    setIsDirectGoogleLoading(true);
    try {
      const preferredRole = activeTab === 'admin_login' ? 'admin' : 'ally';
      const res = await loginWithGoogle(targetEmail, undefined, preferredRole);
      if (res.success) {
        triggerConfetti();
        setUnauthorizedDomain(null);
      } else {
        if (activeTab === 'admin_login') {
          setAdminError(res.message);
        } else {
          setAllyError({ message: res.message });
        }
      }
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Error al conectar con Google';
      if (activeTab === 'admin_login') {
        setAdminError(errorMsg);
      } else {
        setAllyError({ message: errorMsg });
      }
    } finally {
      setIsDirectGoogleLoading(false);
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

  // Handle Phone Registration: Send SMS Code
  const handleRegSendSms = async () => {
    setRegError(null);
    const cleanDigits = regPhoneSms.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setRegError('Por favor ingresa un número de celular válido de 10 dígitos (Ej: 300 123 4567).');
      return;
    }

    setIsRegSendingSms(true);
    try {
      const res = await sendPhoneCode(regPhoneSms, 'recaptcha-portal-reg');
      if (res.success && res.confirmationResult) {
        setRegConfirmationResult(res.confirmationResult);
        setRegSmsSent(true);
        if (res.isSimulated && res.simulatedCode) {
          setRegSmsCode(res.simulatedCode);
        }
      } else {
        setRegError(res.message || 'Error al enviar código SMS de verificación.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Error al enviar SMS de verificación telefónica.');
    } finally {
      setIsRegSendingSms(false);
    }
  };

  // Handle Phone Registration: Verify SMS & Register
  const handleRegPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regSmsSent || !regConfirmationResult) {
      setRegError('Por favor solicita primero el código SMS de verificación.');
      return;
    }

    const cleanCode = regSmsCode.replace(/\D/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      setRegError('El código SMS de verificación debe ser de 6 dígitos numéricos.');
      return;
    }

    if (!regName.trim()) {
      setRegError('Por favor ingresa tu Nombre Completo o Razón Social.');
      return;
    }

    if (!regDocument.trim()) {
      setRegError('Por favor ingresa tu Número de Cédula o NIT.');
      return;
    }

    if (!regBusinessName.trim()) {
      setRegError('Por favor indica a qué Empresa o Aliado Comercial perteneces.');
      return;
    }

    const existing = users.find(u => u.documentId.trim().toLowerCase() === regDocument.trim().toLowerCase());
    if (existing) {
      setRegError('Ya existe un usuario registrado con este número de documento.');
      return;
    }

    setIsRegVerifyingSms(true);
    try {
      const res = await registerWithPhone({
        name: regName.trim(),
        documentId: regDocument.trim(),
        businessName: regBusinessName.trim(),
        phone: regPhoneSms.trim(),
        email: regEmail.trim() || undefined,
        confirmationResult: regConfirmationResult,
        code: cleanCode
      });

      if (res.success) {
        triggerConfetti();
        setRegSuccess(true);
        setTimeout(async () => {
          await loginAsAlly(regDocument.trim());
        }, 1200);
      } else {
        setRegError(res.message);
      }
    } catch (err: any) {
      setRegError(err?.message || 'Error al validar el código SMS o crear la cuenta.');
    } finally {
      setIsRegVerifyingSms(false);
    }
  };

  // Handle Phone Login: Send SMS Code
  const handleLoginSendSms = async () => {
    setAllyError(null);
    const cleanDigits = loginPhoneSms.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setAllyError({ message: 'Por favor ingresa un número de celular válido de 10 dígitos (Ej: 300 123 4567).' });
      return;
    }

    setIsLoginSendingSms(true);
    try {
      const res = await sendPhoneCode(loginPhoneSms, 'recaptcha-portal-login');
      if (res.success && res.confirmationResult) {
        setLoginConfirmationResult(res.confirmationResult);
        setLoginSmsSent(true);
        if (res.isSimulated && res.simulatedCode) {
          setLoginSmsCode(res.simulatedCode);
        }
      } else {
        setAllyError({ message: res.message || 'Error al enviar código SMS de verificación.' });
      }
    } catch (err: any) {
      setAllyError({ message: err?.message || 'Error al enviar SMS de verificación.' });
    } finally {
      setIsLoginSendingSms(false);
    }
  };

  // Handle Phone Login: Verify SMS & Login
  const handleLoginSmsVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAllyError(null);

    if (!loginConfirmationResult) {
      setAllyError({ message: 'Por favor solicita primero el código SMS de verificación.' });
      return;
    }

    const cleanCode = loginSmsCode.replace(/\D/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      setAllyError({ message: 'El código de verificación debe contener 6 dígitos numéricos.' });
      return;
    }

    setIsLoginVerifyingSms(true);
    try {
      const res = await verifyPhoneAndLogin(loginPhoneSms, cleanCode, loginConfirmationResult);
      if (res.success) {
        if (res.isNewUser) {
          setRegPhoneSms(loginPhoneSms);
          setRegPhone(loginPhoneSms);
          setRegSubMode('phone');
          setActiveTab('ally_register');
          setRegError('Número verificado. Completa los datos de tu negocio para finalizar tu registro.');
        } else {
          triggerConfetti();
        }
      } else {
        setAllyError({ message: res.message });
      }
    } catch (err: any) {
      setAllyError({ message: err?.message || 'Error al verificar el código SMS de acceso.' });
    } finally {
      setIsLoginVerifyingSms(false);
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
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ally_login'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
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
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
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
                ? 'bg-blue-950 text-blue-300 border border-blue-800 shadow-md font-black'
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
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-950/80 border border-blue-500/50 text-blue-200 text-xs space-y-3.5 animate-in fade-in shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Dominio no autorizado en Firebase Auth</h4>
                    <p className="text-blue-300/90 text-xs mt-0.5">
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
                  <code className="text-blue-300 font-mono text-xs select-all break-all">{unauthorizedDomain}</code>
                </div>
                <button
                  type="button"
                  onClick={() => copyDomainToClipboard(unauthorizedDomain)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  {hasCopiedDomain ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
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
                  <li>Haz clic en <strong className="text-blue-300">"Add domain"</strong>, pega el dominio copiado y guarda.</li>
                </ol>
              </div>

              {/* Acceso directo con tu cuenta de Google en este entorno */}
              <div className="p-3.5 bg-blue-900/40 rounded-xl border border-blue-500/40 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-blue-300 shrink-0" />
                  <span>Acceso directo con tu cuenta en este entorno</span>
                </div>
                <p className="text-[11px] text-blue-200/90 leading-relaxed">
                  Para no detenerte mientras autorizas el dominio en Firebase Console, puedes ingresar directamente con tu correo:
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full flex-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={directGoogleEmail}
                      onChange={(e) => setDirectGoogleEmail(e.target.value)}
                      placeholder="ej: supergestionesintegrales@gmail.com o aliado@correo.com"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDirectGoogleSignIn()}
                    disabled={isDirectGoogleLoading}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isDirectGoogleLoading ? 'Iniciando...' : `Ingresar como ${activeTab === 'admin_login' ? 'Administrador' : 'Aliado'}`}</span>
                  </button>
                </div>
              </div>

              {/* Botón directo a Firebase Console */}
              <div className="pt-1 flex flex-wrap gap-2">
                <a
                  href="https://console.firebase.google.com/project/superpuntos-on/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
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
                  <LogIn className="w-5 h-5 text-blue-400" />
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
                    ? 'bg-blue-950/80 border-blue-500/40 text-blue-200' 
                    : 'bg-red-950/70 border-red-500/40 text-red-200'
                }`}>
                  <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${allyError.notRegistered ? 'text-blue-300' : 'text-red-400'}`} />
                  <div className="flex-1 space-y-2.5">
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
                        <span>Crear mi cuenta de Aliado con esta cédula →</span>
                      </button>
                    )}
                  </div>
                </div>
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

              {/* Invisible Recaptcha Container for Phone Login */}
              <div id="recaptcha-portal-login"></div>

              {/* Login Method Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-bold mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setAllyError(null);
                  }}
                  className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginMethod === 'password'
                      ? 'bg-blue-600 text-white shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Cédula / Contraseña</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('sms');
                    setAllyError(null);
                  }}
                  className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginMethod === 'sms'
                      ? 'bg-blue-600 text-white shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Código SMS a Celular</span>
                </button>
              </div>

              {loginMethod === 'sms' ? (
                /* Phone SMS Login Flow */
                <form onSubmit={handleLoginSmsVerify} className="space-y-4">
                  {/* Phone input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-2">
                      Número de Celular Registrado <span className="text-blue-400 font-bold">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          🇨🇴 +57
                        </span>
                        <input
                          type="tel"
                          required
                          disabled={loginSmsSent || isLoginSendingSms}
                          value={loginPhoneSms}
                          onChange={(e) => {
                            setLoginPhoneSms(e.target.value);
                            if (allyError) setAllyError(null);
                          }}
                          placeholder="300 123 4567"
                          className="w-full pl-18 pr-3 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-blue-500 disabled:opacity-60"
                        />
                      </div>
                      {!loginSmsSent && (
                        <button
                          type="button"
                          disabled={isLoginSendingSms || !loginPhoneSms.trim()}
                          onClick={handleLoginSendSms}
                          className="px-4 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {isLoginSendingSms ? (
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
                  </div>

                  {loginSmsSent && (
                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>Código SMS enviado a <strong>{loginPhoneSms}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={handleLoginSendSms}
                          disabled={isLoginSendingSms}
                          className="text-[11px] text-blue-400 hover:underline font-bold cursor-pointer shrink-0 ml-2"
                        >
                          Reenviar
                        </button>
                      </div>

                      {/* Code input */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-2">
                          Código de Verificación SMS (6 dígitos) <span className="text-blue-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          autoFocus
                          value={loginSmsCode}
                          onChange={(e) => setLoginSmsCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-600 bg-slate-950 text-xl text-center tracking-widest font-black text-white font-mono focus:outline-hidden focus:border-blue-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoginVerifyingSms}
                        className="w-full py-4 px-6 rounded-xl font-black text-base bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-3 disabled:opacity-50"
                      >
                        {isLoginVerifyingSms ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Verificando código...</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="w-5 h-5 stroke-[2.5]" />
                            <span>Verificar Código e Ingresar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                /* Standard Credentials Form */
                <form onSubmit={handleAllySubmit} className="space-y-4">
                  
                  {/* Document Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-2">
                      Cédula / Documento de Identidad <span className="text-blue-400 font-bold">*</span>
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
                      placeholder="Ingresa tu número de documento o celular"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
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

                  {/* Submit Button: Iniciar Sesión justo debajo de Cédula y Contraseña */}
                  <button
                    id="btn-iniciar-sesion-aliado"
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-4 px-6 rounded-xl font-black text-base bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-3"
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
              )}


              {/* Forgot Password Link */}
              <div className="text-center pt-1">
                <button
                  id="btn-olvido-contrasena"
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs text-slate-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
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
              
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
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

              {/* Invisible Recaptcha Container for Registration */}
              <div id="recaptcha-portal-reg"></div>

              {/* Registration Sub-mode Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-bold mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setRegSubMode('phone');
                    setRegError(null);
                  }}
                  className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    regSubMode === 'phone'
                      ? 'bg-blue-600 text-white shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Con Celular (SMS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegSubMode('standard');
                    setRegError(null);
                  }}
                  className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    regSubMode === 'standard'
                      ? 'bg-blue-600 text-white shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Con Cédula y Contraseña</span>
                </button>
              </div>

              {regSubMode === 'phone' ? (
                /* Phone Registration Form */
                <form onSubmit={handleRegPhoneSubmit} className="space-y-4">
                  {/* Phone input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                      <span>Número de Celular <span className="text-blue-400 font-bold">*</span></span>
                      {regSmsSent && (
                        <button
                          type="button"
                          onClick={() => {
                            setRegSmsSent(false);
                            setRegSmsCode('');
                            setRegConfirmationResult(null);
                          }}
                          className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                        >
                          Cambiar número
                        </button>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          🇨🇴 +57
                        </span>
                        <input
                          type="tel"
                          required
                          disabled={regSmsSent || isRegSendingSms}
                          value={regPhoneSms}
                          onChange={(e) => {
                            setRegPhoneSms(e.target.value);
                            if (regError) setRegError(null);
                          }}
                          placeholder="300 123 4567"
                          className="w-full pl-18 pr-3 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-blue-500 disabled:opacity-60"
                        />
                      </div>
                      {!regSmsSent && (
                        <button
                          type="button"
                          disabled={isRegSendingSms || !regPhoneSms.trim()}
                          onClick={handleRegSendSms}
                          className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {isRegSendingSms ? (
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
                    <p className="text-[10px] text-slate-400 mt-1">
                      Recibirás un código de 6 dígitos vía SMS para verificar tu identidad mediante Firebase Auth.
                    </p>
                  </div>

                  {regSmsSent && (
                    <div className="space-y-4 pt-2 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>Código SMS enviado a <strong>{regPhoneSms}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRegSendSms}
                          disabled={isRegSendingSms}
                          className="text-[11px] text-blue-400 hover:underline font-bold cursor-pointer shrink-0 ml-2"
                        >
                          Reenviar
                        </button>
                      </div>

                      {/* SMS Code */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                          Código de Verificación SMS (6 dígitos) <span className="text-blue-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          autoFocus
                          value={regSmsCode}
                          onChange={(e) => setRegSmsCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-950 text-xl text-center tracking-widest font-black text-white font-mono focus:outline-hidden focus:border-blue-500"
                        />
                      </div>

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
                          className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>

                      {/* Grid 2 Cols: Document & Business */}
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
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
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
                              placeholder="Ej: SuperGIROS La Estación..."
                              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                            />
                            <Building2 className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      </div>

                      {/* Optional Email */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                          Correo Electrónico (Opcional)
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="aliado@correo.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                          />
                          <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isRegVerifyingSms}
                        className="w-full py-4 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2 disabled:opacity-50"
                      >
                        {isRegVerifyingSms ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verificando SMS y creando cuenta...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-blue-300" />
                            <span>Verificar Código y Crear Cuenta</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                /* Standard Form */
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

                  {/* Grid 2 Cols: Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Correo Electrónico <span className="text-blue-400 font-bold">*</span>
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
                          className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                        <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      </div>
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
                    disabled={isRegistering || regSuccess}
                    className="w-full py-4 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
                  >
                    {isRegistering ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Registrando cuenta en la base de datos...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-blue-300" />
                        <span>Registrarme y Acceder</span>
                      </>
                    )}
                  </button>

                </form>
              )}


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
                    Usuario / Correo Administrativo Autorizado <span className="text-blue-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@superpuentos.online o supergestionesintegrales@gmail.com"
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
