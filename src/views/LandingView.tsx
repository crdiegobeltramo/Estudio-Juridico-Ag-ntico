import React from 'react';
import { 
  Scale, 
  Bot, 
  Sparkles, 
  BookOpen, 
  Gavel, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  LogIn, 
  UserPlus, 
  ChevronRight,
  Database,
  ScrollText,
  Wallet
} from 'lucide-react';

interface LandingViewProps {
  onGoToAuth: (initialMode?: 'login' | 'register') => void;
  onGoToApp: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onGoToAuth, onGoToApp }) => {
  return (
    <div className="min-h-screen bg-[#060b16] text-slate-100 flex flex-col font-sans selection:bg-[#c5a059] selection:text-[#0b1325]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#080e1d]/90 backdrop-blur-md border-b border-[#1d2f5d]/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#876524] p-0.5 shadow-lg shadow-[#c5a059]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a1325] rounded-[9px] flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#f3dfa2]" />
              </div>
            </div>
            <div>
              <div className="font-serif text-base font-bold tracking-wide text-[#fdfbf7] uppercase leading-tight">
                Academia Virtual del Derecho
              </div>
              <div className="text-[11px] font-sans font-semibold tracking-wider text-[#c5a059] uppercase flex items-center gap-1.5">
                Plataforma Jurídica Integral <span className="px-1.5 py-0.2 text-[9px] bg-[#c5a059]/20 text-[#e5c378] rounded border border-[#c5a059]/30">IA 3.8</span>
              </div>
            </div>
          </div>

          {/* Navigation Links & CTAs */}
          <div className="flex items-center gap-3">
            {/* Creative Legal Button: Catálogo Oficial */}
            <a
              href="https://academiavirtualdelderecho.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#17274e] via-[#122042] to-[#1a2d59] border border-[#c5a059]/60 hover:border-[#f3dfa2] text-xs font-semibold text-[#fdfbf7] hover:text-[#f3dfa2] transition-all shadow-sm group"
              title="Ingresa a https://academiavirtualdelderecho.netlify.app/ y adquiere tu resumen"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#c5a059] group-hover:scale-110 transition-transform" />
              <span className="font-serif font-bold text-xs tracking-wide">Consulta nuestro catálogo</span>
              <ExternalLink className="w-3 h-3 text-[#c5a059] opacity-80 group-hover:opacity-100" />
            </a>

            <button
              onClick={() => onGoToAuth('login')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-[#101c38] hover:bg-[#15254b] border border-[#1d2f5d] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              onClick={() => onGoToAuth('register')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#0b1325] bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] hover:to-[#b38728] shadow-md shadow-[#c5a059]/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#0b1325]" />
              <span>Registrarse</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 border-b border-[#1d2f5d]/50 bg-gradient-to-b from-[#080e1d] via-[#0b152d] to-[#060b16]">
        {/* Juridical Watermark */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none text-[#c5a059] hidden lg:block">
          <Scale className="w-[500px] h-[500px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#f3dfa2] text-xs font-semibold uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#c5a059]" /> Sistema Doctrinal y Judicial de la República Argentina
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#fdfbf7] tracking-tight leading-tight">
            La Nueva Era de la <br />
            <span className="bg-gradient-to-r from-[#f3dfa2] via-[#c5a059] to-[#dfb76c] bg-clip-text text-transparent">
              Práctica & Educación Jurídica
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Potenciada por inteligencia artificial jurídica avanzada, motor RAG conectado a <strong>InfoLEG, SAIJ y CSJN</strong>, expedientes inteligentes y campus universitario con simuladores de exámenes orales.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onGoToAuth('login')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] font-serif font-bold text-sm shadow-xl shadow-[#c5a059]/30 transition-all hover:scale-105 flex items-center gap-2.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#0b1325]" />
              <span>Ingresar a la Plataforma</span>
              <ArrowRight className="w-4 h-4 text-[#0b1325]" />
            </button>

            <button
              onClick={() => onGoToAuth('register')}
              className="px-6 py-3.5 rounded-xl bg-[#101e3d] hover:bg-[#162a56] border-2 border-[#1d2f5d] hover:border-[#c5a059]/80 text-[#fdfbf7] font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#c5a059]" />
              <span>Crear Cuenta con Firebase</span>
            </button>

            <button
              onClick={onGoToApp}
              className="px-5 py-3.5 rounded-xl bg-transparent hover:bg-[#132247]/60 text-slate-300 hover:text-white border border-[#1d2f5d] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explorar Demo Directa</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Editorial Banner Highlight */}
          <div className="pt-6 max-w-2xl mx-auto">
            <a
              href="https://academiavirtualdelderecho.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border-2 border-[#c5a059]/60 hover:border-[#f3dfa2] bg-gradient-to-r from-[#111f42] via-[#0d1732] to-[#182b57] p-4 shadow-xl transition-all hover:scale-102 text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#876524] p-0.5 shrink-0 flex items-center justify-center">
                    <div className="w-full h-full bg-[#0a1325] rounded-[9px] flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[#f3dfa2]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#c5a059] tracking-wider bg-[#c5a059]/20 px-2 py-0.5 rounded border border-[#c5a059]/30">
                        Editorial Oficial AVD
                      </span>
                      <span className="text-[11px] text-slate-400">Resúmenes Doctrinarios</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#fdfbf7] group-hover:text-[#f3dfa2] transition-colors mt-0.5">
                      Consulta nuestro catálogo
                    </h4>
                    <p className="text-xs text-slate-300">
                      Ingresa a la tienda oficial y adquiere tu resumen de materias universitarias y tratados.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#c5a059] group-hover:text-[#f3dfa2]">
                  <span className="hidden sm:inline">Adquirir</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#c5a059]">
            Arquitectura Jurídica Integral
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#fdfbf7]">
            Diseñada para Litigantes, Magistrados, Docentes y Estudiantes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#0b1429] border border-[#1d2f5d] rounded-2xl p-6 space-y-4 hover:border-[#c5a059]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#142347] flex items-center justify-center text-[#c5a059] border border-[#1d2f5d]">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#fdfbf7]">
              Asistente Jurídico Gemini 3.8
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consultas doctrinales especializadas, redacción de escritos, demandas, cédulas y recursos extraordinarios con estricto apego a las normas procesales argentinas.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0b1429] border border-[#1d2f5d] rounded-2xl p-6 space-y-4 hover:border-[#c5a059]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#142347] flex items-center justify-center text-[#e5c378] border border-[#1d2f5d]">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#fdfbf7]">
              Motor RAG Normativo & Fallos CSJN
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Búsqueda semántica con verificación en fuentes fidedignas (InfoLEG, SAIJ, CSJN). Citas bibliográficas y números de fallos oficiales sin alucinaciones.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0b1429] border border-[#1d2f5d] rounded-2xl p-6 space-y-4 hover:border-[#c5a059]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#142347] flex items-center justify-center text-emerald-400 border border-[#1d2f5d]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#fdfbf7]">
              Campus Universitario & Oral Simulator
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tarjetas de estudio con repetición espaciada, cuestionarios por materia y simulador oral evaluado por tribunal con rúbrica pedagógica universitaria.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0b1429] border border-[#1d2f5d] rounded-2xl p-6 space-y-4 hover:border-[#c5a059]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#142347] flex items-center justify-center text-purple-400 border border-[#1d2f5d]">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#fdfbf7]">
              Estudio Jurídico & Expedientes
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gestión de causas, plazos procesales perentorios con cálculo de días hábiles judiciales, vencimientos de cédulas y almacenamiento digital de expedientes.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#0b1429] border border-[#1d2f5d] rounded-2xl p-6 space-y-4 hover:border-[#c5a059]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#142347] flex items-center justify-center text-amber-400 border border-[#1d2f5d]">
              <ScrollText className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#fdfbf7]">
              Tribuna IA — Simulación de Juicios
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mesa de debate dialéctico contra un oponente IA con diferentes posturas procesales y evaluación del impacto de tus argumentos jurídicos.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#0b1429] border border-[#1d2f5d] rounded-2xl p-6 space-y-4 hover:border-[#c5a059]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#142347] flex items-center justify-center text-[#009ee3] border border-[#1d2f5d]">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#fdfbf7]">
              Cobros con Mercado Pago Argentina
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Integración nativa con Mercado Pago para cobro de membresías y aranceles en Pesos Argentinos (ARS) de forma instantánea y transparente.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1d2f5d]/60 bg-[#040810] py-8 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#c5a059]" />
            <span className="font-serif font-semibold text-slate-200">Academia Virtual del Derecho</span>
            <span>• República Argentina</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onGoToAuth('login')} className="hover:text-white transition-colors cursor-pointer">
              Iniciar Sesión
            </button>
            <button onClick={() => onGoToAuth('register')} className="hover:text-white transition-colors cursor-pointer">
              Registrarse
            </button>
            <a
              href="https://academiavirtualdelderecho.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c5a059] hover:underline"
            >
              Catálogo de Resúmenes
            </a>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Academia Virtual del Derecho. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
