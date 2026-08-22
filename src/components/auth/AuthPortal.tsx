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
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthPortalProps {
  onOpenRegisterAlly?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = () => {
  const { 
    users, 
    loginAsAlly, 
    loginAsAdmin, 
    registerAlly, 
    triggerConfetti,
    syncUsersFromGoogleSheets,
    isGoogleConnected
  } = useApp();

  // Active Tab: 'ally_login' | 'ally_register' | 'admin_login'
  const [activeTab, setActiveTab] = useState<'ally_login' | 'ally_register' | 'admin_login'>('ally_login');

  // Ally Login Form State (Clean - No pre-fills or hints)
  const [allyDocument, setAllyDocument] = useState('');
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
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

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
      registerAlly({
        name: regName.trim(),
        documentId: regDocument.trim(),
        businessName: regBusinessName.trim() || undefined,
        email: regEmail.trim(),
        phone: regPhone.trim() || '300 000 0000',
        password: regPassword
      });

      triggerConfetti();
      setRegSuccess(true);

      setTimeout(async () => {
        await loginAsAlly(regDocument.trim(), regPassword);
      }, 1200);
    } catch {
      setRegError('Hubo un problema al registrar la cuenta. Intenta de nuevo.');
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

  const handleManualSyncSheets = async () => {
    setIsSyncingSheets(true);
    try {
      await syncUsersFromGoogleSheets();
    } finally {
      setIsSyncingSheets(false);
    }
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

        <div className="flex items-center gap-3">
          {isGoogleConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Base de Datos Excel Conectada</span>
              <button
                onClick={handleManualSyncSheets}
                disabled={isSyncingSheets}
                title="Sincronizar base de datos de usuarios desde Excel"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>
          ) : null}

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            En línea
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
            El sistema valida tus credenciales directamente en la base de datos de usuarios de Excel.
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
        <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
          
          {/* ================= VIEW 1: INGRESO ALIADO ================= */}
          {activeTab === 'ally_login' && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-amber-500" />
                  Iniciar Sesión como Aliado Comercial
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ingresa tu cédula y contraseña registrada en la base de datos de Excel.
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

              {/* Form */}
              <form onSubmit={handleAllySubmit} className="space-y-4">
                
                {/* Document Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Cédula / Documento de Identidad <span className="text-amber-500">*</span>
                  </label>
                  <input
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
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Contraseña <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <input
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-4 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validando en base de datos...</span>
                    </>
                  ) : (
                    <>
                      <span>Ingresar al Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

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
                  Diligencia tus datos. Al registrarte quedarás guardado en la base de datos de Excel.
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

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nombre Completo / Razón Social <span className="text-amber-500">*</span>
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
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Cédula / NIT <span className="text-amber-500">*</span>
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
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Correo Electrónico <span className="text-amber-500">*</span>
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
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Contraseña <span className="text-amber-500">*</span>
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
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Confirmar Contraseña <span className="text-amber-500">*</span>
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
                  ¿Ya tienes cuenta registrada en la base de datos?{' '}
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
                  Panel de control de inventarios, auditoría de SOATs y sincronización con Google Sheets.
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
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Usuario / Correo Administrativo <span className="text-amber-500">*</span>
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
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Contraseña de Administrador <span className="text-amber-500">*</span>
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
                      <Lock className="w-4 h-4" />
                      <span>Ingresar al Panel Administrativo</span>
                    </>
                  )}
                </button>

              </form>

            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-900">
        <p>
          © 2026 SuperGIROS • Red de Aliados Superpuntos • Todos los derechos reservados
        </p>
      </footer>

    </div>
  );
};
