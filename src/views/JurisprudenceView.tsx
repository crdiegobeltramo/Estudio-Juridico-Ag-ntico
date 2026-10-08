import React, { useState } from 'react';
import { 
  Gavel, 
  Search, 
  GitFork, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  Calendar, 
  Scale, 
  Share2, 
  Copy, 
  Check, 
  ChevronRight,
  Sparkles,
  Bot
} from 'lucide-react';
import { CaseBrief } from '../types/index.ts';

interface JurisprudenceViewProps {
  onAskAIAboutCase?: (caseCaratula: string) => void;
}

export const JurisprudenceView: React.FC<JurisprudenceViewProps> = ({ onAskAIAboutCase }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('halabi');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ficha' | 'linea' | 'comparador'>('ficha');
  const [compareCaseId, setCompareCaseId] = useState<string>('siri');
  const [copied, setCopied] = useState(false);

  const casesData: Record<string, {
    id: string;
    caratula: string;
    fallosRef: string;
    tribunal: string;
    fecha: string;
    materia: string;
    brief: CaseBrief;
  }> = {
    halabi: {
      id: 'halabi',
      caratula: 'Halabi, Ernesto c/ P.E.N. - ley 25.873 - dto. 1563/04 s/ amparo ley 16.986',
      fallosRef: 'Fallos 332:111',
      tribunal: 'Corte Suprema de Justicia de la Nación',
      fecha: '2009-02-24',
      materia: 'Derecho Procesal Constitucional / Acciones de Clase',
      brief: {
        caratula: 'Halabi, Ernesto c/ P.E.N. s/ amparo',
        tribunal: 'CSJN',
        expedienteNumber: 'H. 270. XLII',
        date: '2009-02-24',
        hechos: 'El letrado Ernesto Halabi interpuso amparo cuestionando la ley 25.873 y dto. 1563/04 que obligaban a las telefónicas a registrar e intervenir comunicaciones por 10 años. Reclamó la tutela de su privacidad y el secreto profesional de sus clientes.',
        cuestionJuridica: '¿Es admisible formalmente en Argentina una acción colectiva que tutele derechos individuales homogéneos con efectos erga omnes ante la omisión legislativa del Congreso?',
        decision: 'La Corte confirmó la inconstitucionalidad de las normas impugnadas y confirió a la sentencia efectos erga omnes para todos los usuarios de telecomunicaciones del país.',
        doctrinaFallo: 'Se fijan tres categorías de derechos: 1) Individuales; 2) Colectivos sobre bienes colectivos; 3) De incidencia colectiva referentes a intereses individuales homogéneos. En estos últimos existe un hecho único o continuado que causa lesión divisible a una pluralidad relevante, y la acción colectiva procede con efectos expansivos bajo pautas de adecuada representación.',
        votosMayoristas: 'Lorenzetti, Highton de Nolasco, Fayt, Petracchi, Maqueda, Zaffaroni y Argibay.',
        votosDisidentes: 'Sin disidencias sustanciales en el fondo; votos concurrentes con precisiones sobre el registro.',
        normasAplicadas: ['Constitución Nacional arts. 18, 19 y 43', 'Pacto de San José de Costa Rica art. 11'],
        lineaPrecedente: 'Evolución de la acción de amparo: "Siri" (1957) -> "Kot" (1958) -> Art. 43 CN (1994) -> "Halabi" (2009).'
      }
    },
    siri: {
      id: 'siri',
      caratula: 'Siri, Ángel s/ interpone recurso de hábeas corpus',
      fallosRef: 'Fallos 239:459',
      tribunal: 'Corte Suprema de Justicia de la Nación',
      fecha: '1957-12-27',
      materia: 'Derecho Constitucional / Amparo Individual',
      brief: {
        caratula: 'Siri, Ángel',
        tribunal: 'CSJN',
        expedienteNumber: 'Fallos 239:459',
        date: '1957-12-27',
        hechos: 'La autoridad policial de la Provincia de Buenos Aires clausuró el diario "El Mercedes" sin expresar causa legal ni orden judicial. El director interpuso un reclamo caratulado como hábeas corpus invocando la libertad de prensa y de trabajo.',
        cuestionJuridica: '¿Tienen operatividad directa las garantías constitucionales ante una agresión arbitraria estatal cuando la ley procesal solo regula el hábeas corpus para la libertad corporal?',
        decision: 'La Corte revocó la denegatoria de primera instancia y ordenó a la policía levantar la clausura e intimidación de inmediato.',
        doctrinaFallo: 'Nacimiento pretoriano del amparo individual: Las garantías constitucionales tienen vigencia directa e inmediata. Basta la comprobación de la restricción arbitraria para que los jueces restablezcan el derecho sin que sea necesaria una ley reglamentaria previa del Congreso.',
        votosMayoristas: 'Voto conjunto de Orgaz, Argañarás, Galli y Herrera.',
        normasAplicadas: ['Constitución Nacional arts. 14, 17, 18, 19, 31'],
        lineaPrecedente: 'Punto de partida de la tutela judicial efectiva en Argentina, continuado por "Kot" (1958) frente a actos de particulares.'
      }
    },
    arriola: {
      id: 'arriola',
      caratula: 'Arriola, Sebastián y otros s/ recurso de hecho en causa N° 9080',
      fallosRef: 'Fallos 332:1963',
      tribunal: 'Corte Suprema de Justicia de la Nación',
      fecha: '2009-08-25',
      materia: 'Derecho Penal Constitucional / Principio de Reserva',
      brief: {
        caratula: 'Arriola, Sebastián y otros',
        tribunal: 'CSJN',
        expedienteNumber: 'A. 891. XLIV',
        date: '2009-08-25',
        hechos: 'Cinco jóvenes fueron interceptados con escasa cantidad de marihuana (entre 1 y 3 cigarrillos) en sus bolsillos para consumo personal, sin exhibición ni ofrecimiento a terceros.',
        cuestionJuridica: '¿Es compatible con el art. 19 de la Constitución Nacional castigar penalmente la tenencia de estupefacientes para consumo personal que no genera peligro concreto para terceros?',
        decision: 'La Corte declaró por unanimidad la inconstitucionalidad del art. 14, segundo párrafo, de la Ley 23.737.',
        doctrinaFallo: 'El principio de reserva del art. 19 CN prohíbe al Estado entrometerse en las acciones privadas que no causen perjuicio o peligro concreto a terceros. La punición del consumidor individual vulnera el libre desarrollo de la personalidad y confunde la persecución del narcotráfico con el tratamiento del usuario.',
        votosMayoristas: 'Lorenzetti, Highton, Fayt, Petracchi, Maqueda, Zaffaroni, Argibay.',
        normasAplicadas: ['Constitución Nacional art. 19, 18, 75 inc. 22', 'Ley 23.737 art. 14'],
        lineaPrecedente: 'Retoma la doctrina libertaria del fallo "Bazterrica" (1986), superando el criterio punitivo de "Montalvo" (1990).'
      }
    },
    mendoza: {
      id: 'mendoza',
      caratula: 'Mendoza, Beatriz Silvia y otros c/ Estado Nacional y otros s/ daños y perjuicios (daños derivados de la contaminación ambiental del Río Matanza-Riachuelo)',
      fallosRef: 'Fallos 331:1622',
      tribunal: 'Corte Suprema de Justicia de la Nación',
      fecha: '2008-07-08',
      materia: 'Derecho Ambiental / Sentencias Estructurales',
      brief: {
        caratula: 'Mendoza, Beatriz y otros c/ Estado Nacional (Causa Riachuelo)',
        tribunal: 'CSJN',
        expedienteNumber: 'M. 1569. XL',
        date: '2008-07-08',
        hechos: 'Vecinos de la cuenca Matanza-Riachuelo demandaron al Estado Nacional, la Provincia de Buenos Aires, CABA y 44 empresas por la degradación ambiental extrema y afectación de la salud pública.',
        cuestionJuridica: '¿Cómo debe el Poder Judicial ordenar y supervisar la remediación de un daño ambiental colectivo complejo que involucra múltiples jurisdicciones concurrentes?',
        decision: 'La Corte dictó una sentencia estructural de condena ambiental obligando a la creación y ejecución de un plan integral de saneamiento coordinado por ACUMAR, delegando el control de ejecución en jueces federales de primera instancia.',
        doctrinaFallo: 'Se consagran las directrices del derecho ambiental del art. 41 CN y Ley General del Ambiente 25.675: principio de prevención, precautorio y de equidad intergeneracional. La tutela del bien colectivo ambiental prima sobre reclamos resarcitorios patrimoniales individuales.',
        votosMayoristas: 'Lorenzetti, Highton, Fayt, Petracchi, Maqueda, Zaffaroni, Argibay.',
        normasAplicadas: ['Constitución Nacional arts. 41 y 43', 'Ley General del Ambiente 25.675'],
        lineaPrecedente: 'Precedente paradigmático en litigio estructural y ejecución de políticas públicas ambientales.'
      }
    }
  };

  const currentCase = casesData[selectedCaseId];
  const compareCase = casesData[compareCaseId];

  const handleCopyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c378] text-xs font-semibold uppercase tracking-wider mb-2">
              <Gavel className="w-3.5 h-3.5" /> Laboratorio de Jurisprudencia CSJN
            </div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#fdfbf7]">
              Fichas Dogmáticas de Fallos & Líneas Jurisprudenciales
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Análisis estructural de las sentencias fundacionales de la Corte Suprema de Justicia de la Nación. Fichas de hechos, holding decisorio, votos disidentes y evolución histórica de precedentes.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-[#122042] p-1 rounded-xl border border-[#1d2f5d] self-start">
            <button
              onClick={() => setActiveTab('ficha')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ficha' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Ficha de Fallo
            </button>
            <button
              onClick={() => setActiveTab('linea')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'linea' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Línea Precedente
            </button>
            <button
              onClick={() => setActiveTab('comparador')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'comparador' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Comparador
            </button>
          </div>
        </div>
      </div>

      {/* Case Selector Pills */}
      <div className="flex flex-wrap gap-2.5">
        {Object.values(casesData).map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCaseId(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              selectedCaseId === c.id
                ? 'bg-[#182c58] text-[#fdfbf7] border-[#c5a059] shadow-sm font-bold'
                : 'bg-[#0c162e] text-slate-300 hover:bg-[#122246] border-[#1d2f5d]'
            }`}
          >
            <span className="text-[#c5a059] font-mono mr-1.5">{c.fallosRef}:</span>
            {c.brief.caratula}
          </button>
        ))}
      </div>

      {activeTab === 'ficha' && (
        <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-6">
          {/* Header of Brief */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1d2f5d] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-[#c5a059] px-2 py-0.5 rounded bg-[#c5a059]/15 border border-[#c5a059]/30">
                  {currentCase.fallosRef}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentCase.tribunal} • Sentencia del {currentCase.fecha}
                </span>
              </div>
              <h2 className="text-lg font-serif font-bold text-[#fdfbf7] mt-1">
                {currentCase.caratula}
              </h2>
              <p className="text-xs text-emerald-400 mt-0.5">
                Materia: {currentCase.materia}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCitation(`CSJN, "${currentCase.caratula}", ${currentCase.fecha}, ${currentCase.fallosRef}`)}
                className="px-3 py-1.5 rounded-lg bg-[#122042] text-slate-300 hover:text-white border border-[#1d2f5d] text-xs flex items-center gap-1.5"
                title="Copiar cita jurisprudencial formal"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#c5a059]" />}
                <span>{copied ? 'Cita Copiada' : 'Copiar Cita CSJN'}</span>
              </button>

              {onAskAIAboutCase && (
                <button
                  onClick={() => onAskAIAboutCase(currentCase.caratula)}
                  className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Bot className="w-3.5 h-3.5" /> Analizar con IA
                </button>
              )}
            </div>
          </div>

          {/* Core Case Brief Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Hechos */}
            <div className="p-4 rounded-xl bg-[#0a1429] border border-[#1d2f5d] space-y-2">
              <h3 className="font-bold text-[#f3dfa2] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span> 1. Plataforma Fáctica (Hechos Comprobados)
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {currentCase.brief.hechos}
              </p>
            </div>

            {/* 2. Cuestión Jurídica */}
            <div className="p-4 rounded-xl bg-[#0a1429] border border-[#1d2f5d] space-y-2">
              <h3 className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> 2. Cuestión de Derecho Sometida a Decisión
              </h3>
              <p className="text-slate-300 leading-relaxed font-medium">
                {currentCase.brief.cuestionJuridica}
              </p>
            </div>

            {/* 3. Doctrina del Fallo (Holding) */}
            <div className="md:col-span-2 p-5 rounded-xl bg-[#0e1d3e] border border-[#c5a059]/40 space-y-2 shadow-inner">
              <h3 className="font-bold text-[#c5a059] uppercase tracking-wider text-xs flex items-center gap-2">
                <Gavel className="w-4 h-4 text-[#c5a059]" /> 3. Doctrina Jurisprudencial Sentada por la Corte (Holding)
              </h3>
              <p className="text-sm font-serif text-[#fdfbf7] leading-relaxed">
                {currentCase.brief.doctrinaFallo}
              </p>
            </div>

            {/* 4. Decisión & Votos */}
            <div className="p-4 rounded-xl bg-[#0a1429] border border-[#1d2f5d] space-y-2">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                4. Decisión Resolutiva & Mayorías
              </h3>
              <p className="text-slate-300 leading-relaxed">{currentCase.brief.decision}</p>
              <div className="mt-2 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Magistrados: </span>
                {currentCase.brief.votosMayoristas}
              </div>
            </div>

            {/* 5. Normas Aplicadas */}
            <div className="p-4 rounded-xl bg-[#0a1429] border border-[#1d2f5d] space-y-2">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                5. Bloque Normativo Aplicado
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentCase.brief.normasAplicadas.map((norm, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-[#132349] text-[#e5c378] font-mono text-[11px] border border-[#1e356c]">
                    {norm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'linea' && (
        <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-serif font-bold text-[#fdfbf7] flex items-center gap-2">
            <GitFork className="w-4 h-4 text-[#c5a059]" /> Línea de Evolución del Precedente Jurisprudencial
          </h2>
          <p className="text-xs text-slate-400">
            Genealogía de las decisiones judiciales que construyeron las garantías procesales fundamentales en la República Argentina:
          </p>

          <div className="relative border-l-2 border-[#c5a059]/40 ml-4 space-y-8 pl-6 py-2">
            <div className="relative group">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#c5a059] border-4 border-[#0c162e]"></div>
              <div className="p-4 rounded-xl bg-[#0e1a36] border border-[#1d2f5d]">
                <div className="flex items-center justify-between text-xs text-[#c5a059] font-mono">
                  <span>1957 • Fallo "Siri, Ángel" (Fallos 239:459)</span>
                  <span className="text-[10px] text-emerald-400">Génesis del Amparo</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-white mt-1">Nacimiento Pretoriano del Amparo frente al Estado</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Las garantías constitucionales rigen en forma directa sin requerir reglamentación legislativa previa.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#c5a059] border-4 border-[#0c162e]"></div>
              <div className="p-4 rounded-xl bg-[#0e1a36] border border-[#1d2f5d]">
                <div className="flex items-center justify-between text-xs text-[#c5a059] font-mono">
                  <span>1958 • Fallo "Kot, Samuel" (Fallos 241:291)</span>
                  <span className="text-[10px] text-emerald-400">Amparo vs. Particulares</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-white mt-1">Extensión del Amparo a Actos de Particulares</h3>
                <p className="text-xs text-slate-300 mt-1">
                  El amparo procede no solo frente a arbitrariedades del Estado sino también ante actos lesivos manifiestos cometidos por particulares.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#c5a059] border-4 border-[#0c162e]"></div>
              <div className="p-4 rounded-xl bg-[#0e1a36] border border-[#1d2f5d]">
                <div className="flex items-center justify-between text-xs text-[#c5a059] font-mono">
                  <span>1994 • Reforma Constitucional (Art. 43 CN)</span>
                  <span className="text-[10px] text-amber-400">Constitucionalización</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-white mt-1">Recepción Constitucional Expresa</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Se consagra la acción expedita de amparo, hábeas data y hábeas corpus, con legitimación del afectado, defensor del pueblo y asociaciones.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-400 border-4 border-[#0c162e]"></div>
              <div className="p-4 rounded-xl bg-[#0e1a36] border border-emerald-500/40">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
                  <span>2009 • Fallo "Halabi, Ernesto" (Fallos 332:111)</span>
                  <span className="text-[10px] text-emerald-300">Acción Colectiva</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-white mt-1">Consagración de las Acciones de Clase en Argentina</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Delineamiento de los intereses individuales homogéneos y efectos erga omnes ante la mora legislativa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparador' && (
        <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1d2f5d] pb-4">
            <h2 className="text-base font-serif font-bold text-[#fdfbf7] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#c5a059]" /> Comparador Doctrinal de Precedentes CSJN
            </h2>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Comparar con:</span>
              <select
                value={compareCaseId}
                onChange={(e) => setCompareCaseId(e.target.value)}
                className="bg-[#122042] text-slate-200 border border-[#1d2f5d] rounded-lg px-2.5 py-1 text-xs focus:outline-none"
              >
                {Object.values(casesData).filter(c => c.id !== selectedCaseId).map(c => (
                  <option key={c.id} value={c.id}>{c.brief.caratula}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Case 1 */}
            <div className="p-5 rounded-xl bg-[#0a1429] border border-[#1d2f5d] space-y-4">
              <div className="border-b border-[#1d2f5d] pb-2">
                <span className="text-[10px] font-mono text-[#c5a059]">{currentCase.fallosRef}</span>
                <h3 className="font-serif font-bold text-sm text-white mt-0.5">{currentCase.brief.caratula}</h3>
                <span className="text-[11px] text-slate-400">{currentCase.fecha} • {currentCase.materia}</span>
              </div>
              <div>
                <span className="font-bold text-slate-300">Cuestión Jurídica:</span>
                <p className="mt-1 text-slate-400">{currentCase.brief.cuestionJuridica}</p>
              </div>
              <div>
                <span className="font-bold text-[#c5a059]">Doctrina Sentada:</span>
                <p className="mt-1 text-slate-200 font-serif leading-relaxed">{currentCase.brief.doctrinaFallo}</p>
              </div>
            </div>

            {/* Case 2 */}
            <div className="p-5 rounded-xl bg-[#0a1429] border border-[#1d2f5d] space-y-4">
              <div className="border-b border-[#1d2f5d] pb-2">
                <span className="text-[10px] font-mono text-[#c5a059]">{compareCase.fallosRef}</span>
                <h3 className="font-serif font-bold text-sm text-white mt-0.5">{compareCase.brief.caratula}</h3>
                <span className="text-[11px] text-slate-400">{compareCase.fecha} • {compareCase.materia}</span>
              </div>
              <div>
                <span className="font-bold text-slate-300">Cuestión Jurídica:</span>
                <p className="mt-1 text-slate-400">{compareCase.brief.cuestionJuridica}</p>
              </div>
              <div>
                <span className="font-bold text-[#c5a059]">Doctrina Sentada:</span>
                <p className="mt-1 text-slate-200 font-serif leading-relaxed">{compareCase.brief.doctrinaFallo}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
