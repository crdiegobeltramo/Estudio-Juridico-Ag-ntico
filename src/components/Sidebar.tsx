import React from 'react';
import { 
  Scale, 
  Bot, 
  Database, 
  BookOpen, 
  Gavel, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  MessageSquareQuote, 
  CalendarClock, 
  ScrollText, 
  ShieldCheck, 
  CreditCard,
  LayoutDashboard,
  Sparkles,
  ChevronRight,
  FolderGit2,
  ExternalLink,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export type NavTab = 
  | 'dashboard'
  | 'multiagent'
  | 'agents_catalog'
  | 'assistant'
  | 'rag'
  | 'library'
  | 'legislation'
  | 'jurisprudence'
  | 'campus'
  | 'lawfirm'
  | 'expediente'
  | 'debate'
  | 'tutor'
  | 'research'
  | 'admin'
  | 'subscription';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onGoToLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onGoToLanding,
}) => {
  const { user, activeRole, setUserRole, openAuthModal, isFirebaseUser } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string; roles?: string[] }[] = [
    { id: 'dashboard', label: 'Panel de Inicio', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'multiagent', label: 'Estudio Multiagente IA', icon: <Scale className="w-4 h-4 text-[#c5a059]" />, badge: 'Orquestador' },
    { id: 'agents_catalog', label: 'Directorio de Agentes', icon: <Users className="w-4 h-4 text-[#e5c378]" />, badge: '27 IA' },
    { id: 'lawfirm', label: 'Estudio Jurídico Digital', icon: <Briefcase className="w-4 h-4" />, badge: 'Galería' },
    { id: 'assistant', label: 'Asistente Jurídico IA', icon: <Bot className="w-4 h-4 text-[#c5a059]" />, badge: 'Gemini' },
    { id: 'rag', label: 'Motor RAG Jurídico', icon: <Sparkles className="w-4 h-4 text-[#e5c378]" /> },
    { id: 'library', label: 'Biblioteca Inteligente', icon: <Database className="w-4 h-4" /> },
    { id: 'legislation', label: 'Explorador Normativo', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'jurisprudence', label: 'Laboratorio de Fallos', icon: <Gavel className="w-4 h-4" /> },
    { id: 'campus', label: 'Campus Universitario', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'expediente', label: 'Expediente Inteligente', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'debate', label: 'Tribuna IA — Debate', icon: <MessageSquareQuote className="w-4 h-4" /> },
    { id: 'tutor', label: 'Tutor & Planificador', icon: <CalendarClock className="w-4 h-4" /> },
    { id: 'research', label: 'Investigación & Notas', icon: <ScrollText className="w-4 h-4" /> },
    { id: 'subscription', label: 'Planes & Membresías', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'admin', label: 'Consola Administrativa', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, badge: 'Admin' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#080e1d] border-r border-[#1d2f5d]/60 flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand / Provisional Typographic Logo */}
        <div className="p-5 border-b border-[#1d2f5d]/50 bg-gradient-to-b from-[#0b1429] to-[#080e1d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c5a059] to-[#876524] p-0.5 shadow-lg shadow-[#c5a059]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b1325] rounded-[7px] flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#f3dfa2]" />
              </div>
            </div>
            <div>
              <div className="font-serif text-sm font-semibold tracking-wide text-[#fdfbf7] uppercase leading-tight">
                Academia Virtual
              </div>
              <div className="text-[11px] font-sans font-bold tracking-wider text-[#c5a059] uppercase flex items-center gap-1.5">
                del Derecho <span className="px-1.5 py-0.2 text-[9px] bg-[#c5a059]/15 text-[#e5c378] rounded border border-[#c5a059]/30">Legal AI</span>
              </div>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] text-slate-400 leading-snug">
            Plataforma Integral de Práctica, Investigación y Docencia Jurídica
          </p>
        </div>

        {/* Role Quick Switcher Pill (Interactive for Multi-Role preview) */}
        <div className="px-4 py-3 bg-[#0c162e]/80 border-b border-[#1d2f5d]/40">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#c5a059] mb-1.5">
            Perfil de Usuario Activo
          </label>
          <select 
            value={activeRole} 
            onChange={(e) => setUserRole(e.target.value as any)}
            className="w-full bg-[#121f3d] text-slate-200 text-xs rounded-md border border-[#1d2f5d] px-2.5 py-1.5 focus:outline-none focus:border-[#c5a059] cursor-pointer"
          >
            <option value="abogado">Abogado / Profesional litigante</option>
            <option value="estudiante">Estudiante de Derecho</option>
            <option value="docente">Docente / Investigador</option>
            <option value="admin_institucion">Admin de Estudio / Institución</option>
            <option value="admin_plataforma">Admin de Plataforma</option>
          </select>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#17274c] to-[#122040] text-[#fdfbf7] border-l-3 border-[#c5a059] shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-[#122040]/50'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isActive ? 'text-[#c5a059]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-[#c5a059]/20 text-[#f3dfa2]' : 'bg-[#1b2b4e] text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Creative Juridical Button Card: Catálogo Editorial Oficial */}
        <div className="px-3 pb-3">
          <a
            href="https://academiavirtualdelderecho.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-xl border-2 border-[#c5a059]/60 hover:border-[#f3dfa2] bg-gradient-to-br from-[#132349] via-[#0d1732] to-[#1a2d59] p-3 shadow-lg shadow-[#c5a059]/10 transition-all duration-300 hover:shadow-xl hover:shadow-[#c5a059]/25 hover:-translate-y-0.5"
            title="Ingresa a https://academiavirtualdelderecho.netlify.app/ y adquiere tu resumen"
          >
            {/* Background Juridical Watermark */}
            <div className="absolute -right-2 -bottom-2 text-[#c5a059]/10 pointer-events-none group-hover:text-[#c5a059]/20 transition-all group-hover:scale-110">
              <Scale className="w-16 h-16" />
            </div>

            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#f3dfa2] border border-[#c5a059]/40">
                  <Sparkles className="w-2.5 h-2.5 text-[#e5c378]" /> Editorial Oficial
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#c5a059] group-hover:text-[#f3dfa2] transition-colors" />
              </div>

              <div>
                <h4 className="font-serif font-bold text-xs text-[#fdfbf7] group-hover:text-[#f3dfa2] transition-colors flex items-center gap-1.5 leading-snug">
                  <BookOpen className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                  Consulta nuestro catálogo
                </h4>
                <p className="text-[10.5px] text-slate-300 leading-snug mt-1">
                  Ingresa y adquiere tu resumen jurídico para exámenes y ejercicio profesional.
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] text-[#e5c378] font-bold border-t border-[#1d2f5d]/60 mt-1">
                <span>Adquirir resumen oficial</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </a>
        </div>

        {/* Footer Info / User Status */}
        <div 
          onClick={openAuthModal}
          className="p-3.5 border-t border-[#1d2f5d]/50 bg-[#070c18] hover:bg-[#0c162e] transition-colors cursor-pointer group"
          title="Ver perfil o iniciar sesión con Google / Correo"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1b2b4e] border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] font-serif font-bold text-xs overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.split(' ').map(n => n[0]).slice(0, 2).join('')
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">{user.name}</p>
                {isFirebaseUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Sesión activa en Firebase"></span>}
              </div>
              <p className="text-[10px] text-[#c5a059] truncate font-medium capitalize">
                {activeRole.replace('_', ' ')} • {isFirebaseUser ? 'Firebase' : 'Acceso'}
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#1d2f5d]/30 text-[10px] text-slate-400 flex justify-between items-center">
            <span>Jurisdicción:</span>
            <span className="text-slate-300 font-medium">República Argentina</span>
          </div>

          {onGoToLanding && (
            <div className="mt-2 pt-2 border-t border-[#1d2f5d]/30">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onGoToLanding();
                }}
                className="w-full text-center text-[10px] text-slate-400 hover:text-[#c5a059] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>← Volver al Sitio Web Principal</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
