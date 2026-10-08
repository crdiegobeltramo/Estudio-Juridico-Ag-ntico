import React, { useState } from 'react';
import { 
  Scale, 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/index.ts';
import { 
  signInWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  resetPassword 
} from '../services/firebase.ts';

interface AuthScreenProps {
  initialMode?: 'login' | 'register';
  onBackToLanding: () => void;
  onEnterApp: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  initialMode = 'login', 
  onBackToLanding, 
  onEnterApp 
}) => {
  const { updateUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('abogado');
  const [institution, setInstitution] = useState('');
  const [matricula, setMatricula] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Nacional / Federal');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const profile = await signInWithGoogle();
      updateUser(profile);
      setSuccessMsg('¡Sesión iniciada exitosamente con Google!');
      setTimeout(() => {
        onEnterApp();
      }, 700);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Ventana de autenticación cancelada.');
      } else {
        setErrorMsg(err.message || 'Error al autenticar con Google y Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor ingrese correo y contraseña.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const profile = await loginWithEmail(email, password);
      updateUser(profile);
      setSuccessMsg('¡Bienvenido! Sesión iniciada correctamente.');
      setTimeout(() => {
        onEnterApp();
      }, 700);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Credenciales inválidas. Verifique su correo o regístrese si es nuevo.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('El formato del correo electrónico no es válido.');
      } else {
        setErrorMsg(err.message || 'Error al iniciar sesión con Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Complete todos los campos requeridos.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const profile = await registerWithEmail(email, password, {
        name: name.trim() || 'Colega Jurídico',
        role,
        institution: institution.trim(),
        matricula: matricula.trim(),
        jurisdiction
      });
      updateUser(profile);
      setSuccessMsg('¡Cuenta registrada exitosamente en Firebase Firestore!');
      setTimeout(() => {
        onEnterApp();
      }, 900);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Este correo ya está registrado. Inicie sesión o recupere su clave.');
      } else {
        setErrorMsg(err.message || 'Error al crear la cuenta en Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Ingrese su correo para enviar el enlace de recuperación.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await resetPassword(email);
      setSuccessMsg('Hemos enviado un enlace de recuperación oficial a su correo electrónico.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('No se pudo enviar el correo de recuperación. Verifique la dirección ingresada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b16] text-slate-100 flex flex-col font-sans selection:bg-[#c5a059] selection:text-[#0b1325]">
      {/* Top Bar with Back Button */}
      <header className="border-b border-[#1d2f5d]/60 bg-[#080e1d] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#101c38] hover:bg-[#16274e] border border-[#1d2f5d] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#c5a059]" />
            <span>Volver a la Página Principal</span>
          </button>

          {/* Quick Demo Bypass */}
          <button
            onClick={onEnterApp}
            className="text-xs text-slate-400 hover:text-[#e5c378] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Continuar a la aplicación en modo demo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Authentication Card Grid */}
      <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-4xl bg-[#0a1327] border-2 border-[#c5a059]/40 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Juridical Institutional Panel (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0c1836] via-[#09142b] to-[#060d1d] p-6 lg:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#1d2f5d]/70 relative">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#876524] p-0.5 shadow-lg shadow-[#c5a059]/20 flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-[#0a1325] rounded-[10px] flex items-center justify-center">
                    <Scale className="w-6 h-6 text-[#f3dfa2]" />
                  </div>
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-[#fdfbf7] uppercase leading-tight">
                    Academia Virtual del Derecho
                  </h2>
                  <p className="text-[11px] text-[#c5a059] font-mono tracking-wider">
                    SISTEMA JUDICIAL & DOCTRINAL
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-serif font-bold text-lg text-white leading-snug">
                  Acceso Seguro a la Plataforma Profesional
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Inicie sesión o regístrese para sincronizar sus causas judiciales, análisis de doctrina y materias de estudio con la nube segura de Firebase.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sincronización con Firebase Firestore</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Asistente con motor de búsqueda en InfoLEG y SAIJ</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Simuladores orales y flashcards universitarias</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Integración de cobros con Mercado Pago ARS</span>
                </div>
              </div>
            </div>

            {/* Creative Legal Button: Catálogo de Resúmenes */}
            <div className="pt-8">
              <a
                href="https://academiavirtualdelderecho.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl border border-[#c5a059]/60 hover:border-[#f3dfa2] bg-[#101e40] p-3.5 shadow-md transition-all hover:scale-102"
                title="Ingresa a https://academiavirtualdelderecho.netlify.app/ y adquiere tu resumen"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#e5c378] tracking-wider bg-[#c5a059]/20 px-2 py-0.5 rounded">
                    Editorial Oficial
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
                </div>
                <h4 className="font-serif font-bold text-xs text-white group-hover:text-[#f3dfa2] mt-1.5">
                  Consulta nuestro catálogo
                </h4>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  Ingresa y adquiere tu resumen jurídico para tus materias y exámenes.
                </p>
              </a>
            </div>
          </div>

          {/* Right Column: Auth Form Area (7 Cols) */}
          <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-center space-y-5">
            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-[#122042] p-1 border border-[#1d2f5d] text-xs">
              <button
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-[#c5a059] text-[#0b1325] shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  mode === 'register' ? 'bg-[#c5a059] text-[#0b1325] shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Registrar Cuenta
              </button>
            </div>

            {/* Google Sign-In */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-100 text-slate-800 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer border border-slate-300 disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <div className="flex-1 h-px bg-[#1d2f5d]"></div>
                <span>o con tu correo y contraseña</span>
                <div className="flex-1 h-px bg-[#1d2f5d]"></div>
              </div>
            </div>

            {/* Error & Success Feedback */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Mode 1: Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleEmailLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@ejemplo.com"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl pl-9 pr-3 py-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">Contraseña:</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#c5a059] hover:underline cursor-pointer"
                    >
                      ¿Olvidó su contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl pl-9 pr-3 py-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] py-3 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>Entrar a la Aplicación</span>
                </button>
              </form>
            )}

            {/* Mode 2: Register Form */}
            {mode === 'register' && (
              <form onSubmit={handleEmailRegister} className="space-y-3 text-xs max-h-[50vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre Completo y Título:</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr./Dra. Nombre y Apellido"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl pl-9 pr-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="letrado@ejemplo.com"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl pl-9 pr-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Rol Jurídico:</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full bg-[#122042] text-slate-100 rounded-xl px-2.5 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="abogado">Abogado / Letrado</option>
                      <option value="estudiante">Estudiante de Derecho</option>
                      <option value="docente">Docente / Investigador</option>
                      <option value="admin_institucion">Admin de Estudio</option>
                      <option value="admin_plataforma">Admin de Plataforma</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Jurisdicción:</label>
                    <input
                      type="text"
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      placeholder="Nacional / Federal"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl px-2.5 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Matrícula (opcional):</label>
                    <input
                      type="text"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      placeholder="T° 124 F° 882 CPACF"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl px-2.5 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Institución / Estudio:</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Estudio Cervelli / UBA"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl px-2.5 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contraseña:</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 caracteres"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl px-2.5 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Confirmar:</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl px-2.5 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-3"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Registrar Cuenta en Firebase</span>
                </button>
              </form>
            )}

            {/* Mode 3: Forgot Password Form */}
            {mode === 'forgot' && (
              <form onSubmit={handlePasswordReset} className="space-y-3.5 text-xs">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ingrese el correo electrónico registrado. Le enviaremos un correo oficial de Firebase para restablecer su clave.
                </p>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico Registrado:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@ejemplo.com"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl pl-9 pr-3 py-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex-1 py-2.5 rounded-xl bg-[#122042] hover:bg-[#182c59] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Volver a Iniciar Sesión
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#c5a059] hover:bg-[#d4af37] text-[#0b1325] font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    {loading ? 'Enviando...' : 'Enviar Enlace'}
                  </button>
                </div>
              </form>
            )}

            {/* Direct Access Prompt */}
            <div className="pt-2 text-center border-t border-[#1d2f5d]/60">
              <button
                onClick={onEnterApp}
                className="text-xs text-[#c5a059] hover:text-[#f3dfa2] hover:underline font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <span>Acceder a la aplicación directamente sin registrarse</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
