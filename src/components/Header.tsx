import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  Globe, 
  ShieldCheck, 
  Building2, 
  SlidersHorizontal,
  CheckCircle2,
  X,
  BookOpen,
  ExternalLink,
  User,
  Scale
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Jurisdiction } from '../types/index.ts';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenGlobalSearch: () => void;
  onGoToLanding?: () => void;
}

const jurisdictionsList: Jurisdiction[] = [
  'Nacional / Federal',
  'Ciudad Autónoma de Buenos Aires (CABA)',
  'Provincia de Buenos Aires',
  'Córdoba',
  'Santa Fe',
  'Mendoza',
  'Derecho Comparado / Mercosur'
];

export const Header: React.FC<HeaderProps> = ({ 
  onOpenMobileMenu, 
  onOpenGlobalSearch, 
  onGoToLanding 
}) => {
  const { 
    activeJurisdiction, 
    setActiveJurisdiction, 
    workspaceName, 
    user, 
    openAuthModal, 
    isFirebaseUser 
  } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showJurisdictionSelect, setShowJurisdictionSelect] = useState(false);

  const notifications = [
    { id: 1, title: 'Nueva acordada CSJN 28/2026', time: 'Hace 2 horas', desc: 'Reglamentación de audiencias testimoniales virtuales en fueros federales.' },
    { id: 2, title: 'Vencimiento procesal próximo', time: 'Mañana 09:30', desc: 'EXP-8834/2026: Vencimiento de plazo para contestación de demanda.' },
    { id: 3, title: 'Actualización en Biblioteca', time: 'Ayer', desc: 'Incorporada doctrina comentada sobre responsabilidad preventiva CCCN art. 1710.' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#091122]/95 backdrop-blur-md border-b border-[#1d2f5d]/60 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Workspace */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#142347] lg:hidden focus:outline-none"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-[#0f1d3c] px-3 py-1.5 rounded-lg border border-[#1d2f5d]/80">
          <Building2 className="w-3.5 h-3.5 text-[#c5a059]" />
          <span className="text-slate-400 font-mono text-[10px]">ESPACIO:</span>
          <span className="font-medium text-slate-200 truncate max-w-[200px]">{workspaceName}</span>
        </div>

        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            className="hidden xl:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#0e1b38] hover:bg-[#15274f] px-2.5 py-1.5 rounded-lg border border-[#1d2f5d] transition-all cursor-pointer"
            title="Volver a la Página Principal (Landing Page)"
          >
            <Scale className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Sitio Web</span>
          </button>
        )}
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-xl mx-2">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full bg-[#0d1832] hover:bg-[#122042] text-slate-400 hover:text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-[#1d2f5d] flex items-center justify-between transition-all group shadow-inner"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-[#c5a059] group-hover:scale-110 transition-transform" />
            <span className="truncate">Buscar en legislación, fallos CSJN, doctrina, expedientes...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono bg-[#16274e] text-slate-300 px-1.5 py-0.5 rounded border border-[#213565]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Jurisdiction Picker, Source status & Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Creative Juridical Button: Consulta nuestro catálogo */}
        <a
          href="https://academiavirtualdelderecho.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#17274e] via-[#122042] to-[#1a2d59] border border-[#c5a059]/60 hover:border-[#f3dfa2] text-xs font-semibold text-[#fdfbf7] hover:text-[#f3dfa2] transition-all shadow-sm group hover:shadow-md hover:shadow-[#c5a059]/20"
          title="Ingresa a https://academiavirtualdelderecho.netlify.app/ y adquiere tu resumen"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#c5a059] group-hover:scale-110 transition-transform" />
          <span className="font-serif font-bold text-xs tracking-wide">Consulta nuestro catálogo</span>
          <ExternalLink className="w-3 h-3 text-[#c5a059] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </a>

        {/* Jurisdiction dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowJurisdictionSelect(!showJurisdictionSelect)}
            className="flex items-center gap-1.5 text-xs bg-[#112040] hover:bg-[#172a54] text-slate-200 px-2.5 py-1.5 rounded-lg border border-[#1d2f5d] transition-colors"
            title="Cambiar jurisdicción activa"
          >
            <Globe className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="hidden md:inline font-medium max-w-[130px] truncate">{activeJurisdiction}</span>
          </button>

          {showJurisdictionSelect && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0d1830] border border-[#1d2f5d] rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#c5a059] tracking-wider border-b border-[#1d2f5d]">
                Seleccionar Jurisdicción
              </div>
              {jurisdictionsList.map(j => (
                <button
                  key={j}
                  onClick={() => {
                    setActiveJurisdiction(j);
                    setShowJurisdictionSelect(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#16284e] transition-colors ${
                    activeJurisdiction === j ? 'text-[#e5c378] font-semibold bg-[#122244]' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{j}</span>
                  {activeJurisdiction === j && <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Official Sources Status indicator */}
        <div className="hidden xl:flex items-center gap-1.5 bg-[#0b172f] border border-[#1d2f5d] px-2.5 py-1 rounded-full text-[11px] text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] text-slate-400">InfoLEG / SAIJ / CSJN:</span>
          <span className="font-semibold text-emerald-400">En Línea</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-[#0e1a34] text-slate-300 hover:text-white hover:bg-[#14264d] border border-[#1d2f5d] relative transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c5a059]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d1830] border border-[#1d2f5d] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-[#112040] border-b border-[#1d2f5d] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Avisos Jurídicos & Procesales</span>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-[#1d2f5d]/50 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-[#132347] transition-colors">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-medium text-[#fdfbf7]">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-[#091122] text-center border-t border-[#1d2f5d]/50">
                <span className="text-[10px] text-[#c5a059] cursor-pointer hover:underline">
                  Ver todas las notificaciones
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Firebase Authentication & User Profile Trigger */}
        <button
          onClick={openAuthModal}
          className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg bg-[#112042] hover:bg-[#182c59] border border-[#1d2f5d] hover:border-[#c5a059]/60 text-xs transition-all shadow-sm group cursor-pointer"
          title={isFirebaseUser ? `Sesión activa en Firebase: ${user.name}` : 'Iniciar sesión o registrarse con Google / Correo'}
        >
          {isFirebaseUser && user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-[#c5a059]" />
          ) : (
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              isFirebaseUser ? 'bg-[#c5a059] text-[#0b1325]' : 'bg-[#1b2b4e] text-slate-300'
            }`}>
              {isFirebaseUser ? user.name[0] : <User className="w-3 h-3 text-[#c5a059]" />}
            </div>
          )}
          <span className="hidden sm:inline font-semibold text-slate-200 group-hover:text-white truncate max-w-[120px]">
            {isFirebaseUser ? user.name.split(' ')[0] : 'Ingresar'}
          </span>
          {isFirebaseUser && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          )}
        </button>
      </div>
    </header>
  );
};
