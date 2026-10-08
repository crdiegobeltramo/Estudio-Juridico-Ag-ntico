import React from 'react';
import { 
  Bot, 
  Sparkles, 
  BookOpen, 
  Gavel, 
  GraduationCap, 
  Briefcase, 
  Clock, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck,
  Calendar,
  FileText,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { NavTab } from '../components/Sidebar.tsx';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user, activeRole, activeJurisdiction } = useAuth();

  const getGreeting = () => {
    switch (activeRole) {
      case 'estudiante':
        return `Bienvenido al Campus, ${user.name.split(' ')[0]}`;
      case 'abogado':
        return `Bienvenido a su Despacho Digital, ${user.name}`;
      case 'docente':
        return `Panel Académico y de Investigación, Prof. ${user.name.split(' ').slice(1).join(' ')}`;
      case 'admin_plataforma':
      case 'admin_institucion':
        return `Consola de Gestión Institucional, ${user.name}`;
      default:
        return `Bienvenido, ${user.name}`;
    }
  };

  const getSubheading = () => {
    switch (activeRole) {
      case 'estudiante':
        return 'Tienes 2 exámenes próximos en calendario. Tu progreso en Derecho de las Obligaciones está al 75%.';
      case 'abogado':
        return '3 expedientes activos con vencimientos perentorios en los próximos 5 días hábiles.';
      case 'docente':
        return 'Cátedra de Derecho Constitucional: 42 estudiantes activos y 3 rúbricas evaluativas sincronizadas.';
      default:
        return 'Todos los módulos normativos, jurisprudenciales y de IA están sincronizados con fuentes oficiales.';
    }
  };

  const quickActions = [
    {
      title: 'Consulta Asistida con IA',
      desc: 'Formule interrogantes con fundamentación rigurosa en el derecho positivo argentino.',
      icon: <Bot className="w-5 h-5 text-[#c5a059]" />,
      tab: 'assistant' as NavTab,
      badge: 'Gemini 3.8 Flash'
    },
    {
      title: 'Motor RAG & Citas Verificadas',
      desc: 'Búsqueda semántica con citas normativas y abstención ante falta de fuentes.',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      tab: 'rag' as NavTab,
      badge: 'Control Veracidad'
    },
    {
      title: 'Redactor Forense de Escritos',
      desc: 'Borradores de demandas, contestaciones, cartas documento y contratos con revisión.',
      icon: <Briefcase className="w-5 h-5 text-blue-400" />,
      tab: 'lawfirm' as NavTab,
      badge: 'Práctica Procesal'
    },
    {
      title: 'Campus & Simulador Oral',
      desc: 'Simulacros de examen final evaluados por tribunal IA con rúbrica pedagógica.',
      icon: <GraduationCap className="w-5 h-5 text-emerald-400" />,
      tab: 'campus' as NavTab,
      badge: 'Evaluación Didáctica'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1834] via-[#102248] to-[#091329] border border-[#1d2f5d] p-6 lg:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c378] text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Jurisdicción: {activeJurisdiction}
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#fdfbf7] tracking-tight">
            {getGreeting()}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {getSubheading()}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('assistant')}
              className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] hover:to-[#b38728] text-[#0b1325] px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Bot className="w-4 h-4" /> Nueva Consulta Jurídica
            </button>
            <button
              onClick={() => onNavigate('legislation')}
              className="bg-[#14264d] hover:bg-[#1a3266] text-slate-200 border border-[#1d2f5d] px-4 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#c5a059]" /> Explorar Legislación Vigente
            </button>
            <button
              onClick={() => onNavigate('jurisprudence')}
              className="bg-[#14264d] hover:bg-[#1a3266] text-slate-200 border border-[#1d2f5d] px-4 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2"
            >
              <Gavel className="w-4 h-4 text-emerald-400" /> Laboratorio de Fallos CSJN
            </button>
            <a
              href="https://academiavirtualdelderecho.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#172852] to-[#101c3d] hover:from-[#1d3368] hover:to-[#162752] text-[#fdfbf7] border-2 border-[#c5a059]/70 hover:border-[#f3dfa2] px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 group cursor-pointer"
              title="Ingresa a https://academiavirtualdelderecho.netlify.app/ y adquiere tu resumen"
            >
              <BookOpen className="w-4 h-4 text-[#c5a059] group-hover:scale-110 transition-transform" />
              <span>Consulta nuestro catálogo</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#c5a059] group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Decorative Watermark / Emblem */}
        <div className="absolute right-4 -bottom-10 opacity-5 pointer-events-none select-none text-slate-100 hidden md:block">
          <Gavel className="w-72 h-72" />
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => (
          <div
            key={idx}
            onClick={() => onNavigate(action.tab)}
            className="group cursor-pointer bg-[#0c162e] hover:bg-[#112042] border border-[#1d2f5d] hover:border-[#c5a059]/60 p-5 rounded-xl transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-[#142347] border border-[#1d2f5d] group-hover:bg-[#1b2f5f] transition-colors">
                  {action.icon}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16274e] text-[#e5c378] border border-[#213565]">
                  {action.badge}
                </span>
              </div>
              <h3 className="font-serif font-semibold text-sm text-[#fdfbf7] group-hover:text-[#c5a059] transition-colors">
                {action.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {action.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1d2f5d]/50 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-200">
              <span className="text-[11px] font-medium">Acceder al módulo</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a059] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split: Agenda/Expedientes & Recent Legal Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agenda & Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Matters / Agenda */}
          <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#c5a059]" />
                <h3 className="font-serif font-semibold text-sm text-[#fdfbf7]">
                  {activeRole === 'estudiante' ? 'Calendario de Exámenes & Entregas' : 'Agenda Procesal & Vencimientos Perentorios'}
                </h3>
              </div>
              <button 
                onClick={() => onNavigate(activeRole === 'estudiante' ? 'tutor' : 'lawfirm')}
                className="text-xs text-[#c5a059] hover:underline flex items-center gap-1"
              >
                Ver todo <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-[#0e1b38] border border-[#1d2f5d] flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">
                      EXP-8834/2026: Vencimiento de plazo para interposición de demanda ordinaria
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Juzgado Nacional del Trabajo N° 23 • Cómputo de días hábiles judiciales con plazo de gracia (primeras dos horas).
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                  8 Oct 2026
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0e1b38] border border-[#1d2f5d] flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">
                      EXP-10482/2025: Traslado de pericia médica traumatológica
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Juzgado Civil y Comercial Federal N° 4 • Plazo de 5 días para formular observaciones e impugnaciones.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold shrink-0">
                  15 Oct 2026
                </span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded bg-[#091124] border border-[#1d2f5d]/60 text-[11px] text-slate-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#c5a059] shrink-0" />
              <span>Aviso: Los plazos deben verificarse con el calendario de feria y días inhábiles del tribunal actuante.</span>
            </div>
          </div>

          {/* Landmark Jurisprudence Highlights */}
          <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-emerald-400" />
                <h3 className="font-serif font-semibold text-sm text-[#fdfbf7]">
                  Jurisprudencia de la CSJN Destacada (Doctrina Legal Vigente)
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('jurisprudence')}
                className="text-xs text-[#c5a059] hover:underline flex items-center gap-1"
              >
                Explorar Fallos <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                onClick={() => onNavigate('jurisprudence')}
                className="p-3.5 rounded-lg bg-[#0e1a36] hover:bg-[#122246] border border-[#1d2f5d] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#c5a059]">Fallos 332:111</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">CSJN</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-100 mt-1">Fallo "Halabi, Ernesto"</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Creación pretoriana de las acciones colectivas para derechos individuales homogéneos y efectos erga omnes.
                </p>
              </div>

              <div 
                onClick={() => onNavigate('jurisprudence')}
                className="p-3.5 rounded-lg bg-[#0e1a36] hover:bg-[#122246] border border-[#1d2f5d] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#c5a059]">Fallos 332:1963</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">CSJN</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-100 mt-1">Fallo "Arriola, Sebastián"</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Inconstitucionalidad de la punición de tenencia para consumo personal escaso al amparo del art. 19 CN.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Status & Saved Queries */}
        <div className="space-y-6">
          {/* Official Database Verification Status */}
          <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-xl p-5 shadow-sm">
            <h3 className="font-serif font-semibold text-sm text-[#fdfbf7] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Conectores Oficiales de Datos
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#0e1a34] border border-[#1d2f5d]/60">
                <span className="text-slate-300 font-medium">InfoLEG (Ministerio de Justicia)</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">Conectado</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0e1a34] border border-[#1d2f5d]/60">
                <span className="text-slate-300 font-medium">SAIJ Información Jurídica</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">Conectado</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0e1a34] border border-[#1d2f5d]/60">
                <span className="text-slate-300 font-medium">CSJN Base de Jurisprudencia</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">Verificado</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0e1a34] border border-[#1d2f5d]/60">
                <span className="text-slate-300 font-medium">Motor IA Gemini 3.8 Flash</span>
                <span className="text-[10px] font-mono text-[#c5a059] font-semibold">Servidor Backend</span>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-slate-400">
              Las consultas normativas se cotejan con textos consolidados sin intermediación sintética no contrastada.
            </p>
          </div>

          {/* Frequent / Saved Consultations */}
          <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-xl p-5 shadow-sm">
            <h3 className="font-serif font-semibold text-sm text-[#fdfbf7] mb-3 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#c5a059]" /> Consultas Doctrinales Recientes
            </h3>
            <div className="space-y-2">
              {[
                { q: 'Causales de eximición en factor objetivo art. 1722 CCCN', branch: 'Civil y Comercial' },
                { q: 'Cómputo de la indemnización por antigüedad art. 245 LCT y fallo Vizzoti', branch: 'Laboral' },
                { q: 'Alcance del amparo individual frente a omisiones de particulares', branch: 'Constitucional' },
                { q: 'Requisitos del Ius Variandi razonable según art. 66 LCT', branch: 'Laboral' }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate('assistant')}
                  className="w-full text-left p-2.5 rounded-lg bg-[#0e1b38] hover:bg-[#132349] border border-[#1d2f5d]/60 transition-colors text-xs text-slate-300 group"
                >
                  <p className="font-medium group-hover:text-[#c5a059] line-clamp-1">{item.q}</p>
                  <span className="text-[10px] text-slate-500">{item.branch}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
