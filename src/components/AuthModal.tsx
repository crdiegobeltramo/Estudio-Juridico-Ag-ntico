import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Scale, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/index.ts';
import { 
  signInWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  resetPassword, 
  logoutUser 
} from '../services/firebase.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, isAuthenticated, isFirebaseUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'profile'>('login');
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

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const profile = await signInWithGoogle();
      updateUser(profile);
      setSuccessMsg('¡Sesión iniciada exitosamente con Google!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Ventana de acceso cancelada por el usuario.');
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
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Credenciales inválidas. Verifique su correo o regístrese si es su primera vez.');
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
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Este correo ya se encuentra registrado. Inicie sesión o recupere su clave.');
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
      setSuccessMsg('Hemos enviado un enlace de recuperación a su correo electrónico.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('No se pudo enviar el correo de recuperación. Verifique la dirección ingresada.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logoutUser();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0c162e] border-2 border-[#c5a059]/50 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1d2f5d] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a059] to-[#876524] p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a1325] rounded-[6px] flex items-center justify-center">
                <Scale className="w-4 h-4 text-[#f3dfa2]" />
              </div>
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#fdfbf7] uppercase tracking-wide">
                Academia Virtual del Derecho
              </h3>
              <p className="text-[10.5px] text-[#c5a059] font-mono">
                Autenticación & Firebase Cloud Security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#16274e]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (Login / Register / Profile) */}
        {isAuthenticated && isFirebaseUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#091329] border border-[#1d2f5d] text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#1b2b4e] border-2 border-[#c5a059] mx-auto flex items-center justify-center text-[#c5a059] font-serif font-bold text-lg overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.split(' ').map(n => n[0]).slice(0, 2).join('')
                )}
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-white">{user.name}</h4>
                <p className="text-xs text-[#c5a059]">{user.email}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verificado en Firebase
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#16274e] text-[#f3dfa2] border border-[#213565]">
                    Rol: {user.role}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1d2f5d] text-left text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Jurisdicción:</span>
                  <span className="font-semibold text-slate-200">{user.jurisdiction}</span>
                </div>
                {user.matricula && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Matrícula:</span>
                    <span className="font-semibold text-slate-200">{user.matricula}</span>
                  </div>
                )}
                {user.institution && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Institución / Estudio:</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[200px]">{user.institution}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan de Membresía:</span>
                  <span className="font-semibold text-[#c5a059] uppercase">{user.plan}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-[#1b253d] hover:bg-[#253352] text-rose-300 border border-rose-500/30 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        ) : (
          <>
            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-[#122042] p-1 border border-[#1d2f5d] text-xs">
              <button
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  mode === 'login' ? 'bg-[#c5a059] text-[#0b1325] shadow-xs' : 'text-slate-300'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  mode === 'register' ? 'bg-[#c5a059] text-[#0b1325] shadow-xs' : 'text-slate-300'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Google Fast Sign-In Button */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-100 text-slate-800 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer border border-slate-300"
              >
                {/* Official Google 'G' Logo */}
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
                <span>o con correo y contraseña</span>
                <div className="flex-1 h-px bg-[#1d2f5d]"></div>
              </div>
            </div>

            {/* Error & Success Alerts */}
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

            {/* Form Mode 1: Login */}
            {mode === 'login' && (
              <form onSubmit={handleEmailLogin} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="letrado@derecho.com.ar"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl pl-9 pr-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">Contraseña:</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10.5px] text-[#c5a059] hover:underline"
                    >
                      ¿Olvidó su clave?
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
                      className="w-full bg-[#122042] text-slate-100 rounded-xl pl-9 pr-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Ingresar a la Plataforma</span>
                </button>
              </form>
            )}

            {/* Form Mode 2: Register */}
            {mode === 'register' && (
              <form onSubmit={handleEmailRegister} className="space-y-2.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
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
                      placeholder="usuario@ejemplo.com"
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
                      <option value="admin_plataforma">Admin Plataforma</option>
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
                    <label className="block text-slate-300 font-semibold mb-1">Estudio / Universidad:</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="UBA / Estudio Cervelli"
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
                    <label className="block text-slate-300 font-semibold mb-1">Repetir Contraseña:</label>
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

            {/* Form Mode 3: Forgot Password */}
            {mode === 'forgot' && (
              <form onSubmit={handlePasswordReset} className="space-y-3 text-xs">
                <p className="text-[11.5px] text-slate-300 leading-relaxed">
                  Ingrese el correo electrónico asociado a su cuenta. Le enviaremos un correo oficial de Firebase para restablecer su contraseña de manera segura.
                </p>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Registrado:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@ejemplo.com"
                      className="w-full bg-[#122042] text-slate-100 rounded-xl pl-9 pr-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex-1 py-2 rounded-xl bg-[#122042] text-slate-300 hover:text-white"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#c5a059] hover:bg-[#d4af37] text-[#0b1325] font-bold py-2 rounded-xl"
                  >
                    {loading ? 'Enviando...' : 'Enviar Enlace'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
