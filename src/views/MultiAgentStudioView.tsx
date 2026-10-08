import React, { useState, useEffect } from 'react';
import {
  Scale,
  Sparkles,
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  FolderPlus,
  Bookmark,
  History,
  RefreshCw,
  ChevronRight,
  Users,
  Eye,
  HelpCircle,
  Gavel,
  BookOpen
} from 'lucide-react';
import {
  ALL_LEGAL_AGENTS,
  LEGAL_TEAMS,
  QUICK_ACTIONS,
  QuickActionType,
  ArgentineJurisdictionContext,
  MultiAgentOrchestrationResponse
} from '../agents/index.ts';
import {
  exportOrchestrationToPDF,
  exportOrchestrationToDOCX,
  exportOrchestrationToTXT,
  exportOrchestrationToMarkdown
} from '../utils/exportDocuments.ts';
import { LegalCaseFile } from '../types/index.ts';

interface MultiAgentStudioViewProps {
  initialAction?: QuickActionType;
  initialTeamId?: string;
  preselectedAgentIds?: string[];
  onConvertToCase?: (newCase: LegalCaseFile) => void;
  onOpenAgentsGallery?: () => void;
}

const ARGENTINE_PROVINCES = [
  'Ciudad Autónoma de Buenos Aires (CABA)',
  'Provincia de Buenos Aires',
  'Córdoba',
  'Santa Fe',
  'Mendoza',
  'Tucumán',
  'Entre Ríos',
  'Salta',
  'Misiones',
  'Chaco',
  'Corrientes',
  'Santiago del Estero',
  'San Juan',
  'Jujuy',
  'Río Negro',
  'Neuquén',
  'Formosa',
  'Chubut',
  'San Luis',
  'Catamarca',
  'La Rioja',
  'La Pampa',
  'Santa Cruz',
  'Tierra del Fuego, Antártida e Islas del Atlántico Sur'
];

const FUEROS_LIST = [
  'Civil y Comercial',
  'Laboral / Del Trabajo',
  'Penal / Correccional',
  'Contencioso Administrativo y Tributario',
  'Familia y Sucesiones',
  'Comercial / Concursos y Quiebras',
  'Seguridad Social / Previsional',
  'Civil y Comercial Federal',
  'Penal Económico / Federal'
];

const PIPELINE_STEPS = [
  '1. CONSULTA',
  '2. DIAGNÓSTICO',
  '3. CLASIFICACIÓN JURÍDICA',
  '4. SELECCIÓN DE AGENTES',
  '5. INVESTIGACIÓN',
  '6. ANÁLISIS',
  '7. REVISIÓN CRÍTICA',
  '8. ESTRATEGIA',
  '9. DOCUMENTO FINAL'
];

export const MultiAgentStudioView: React.FC<MultiAgentStudioViewProps> = ({
  initialAction = 'CONSULTA_JURIDICA',
  initialTeamId = '',
  preselectedAgentIds = [],
  onConvertToCase,
  onOpenAgentsGallery
}) => {
  const [selectedAction, setSelectedAction] = useState<QuickActionType>(initialAction);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialTeamId);
  const [customAgentIds, setCustomAgentIds] = useState<string[]>(preselectedAgentIds);
  const [query, setQuery] = useState<string>('');
  const [attachedDocName, setAttachedDocName] = useState<string>('');
  const [attachedDocText, setAttachedDocText] = useState<string>('');

  const [jurisdictionContext, setJurisdictionContext] = useState<ArgentineJurisdictionContext>({
    pais: 'Argentina',
    tipoJurisdiccion: 'Nacional',
    provincia: 'Ciudad Autónoma de Buenos Aires (CABA)',
    ciudad: 'Buenos Aires',
    fuero: 'Civil y Comercial',
    tribunal: 'Juzgado Nacional de Primera Instancia en turno'
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [activePipelineIndex, setActivePipelineIndex] = useState<number>(0);
  const [result, setResult] = useState<MultiAgentOrchestrationResponse | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<
    'consolidado' | 'agentes' | 'epistemico' | 'estrategia' | 'cronologia' | 'borrador'
  >('consolidado');
  const [historyList, setHistoryList] = useState<MultiAgentOrchestrationResponse[]>(() => {
    try {
      const raw = localStorage.getItem('avd_multiagent_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [favoritesIds, setFavoritesIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('avd_multiagent_favorites');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [caseCreatedToast, setCaseCreatedToast] = useState<string | null>(null);

  useEffect(() => {
    if (initialAction) setSelectedAction(initialAction);
  }, [initialAction]);

  useEffect(() => {
    if (initialTeamId) setSelectedTeamId(initialTeamId);
  }, [initialTeamId]);

  useEffect(() => {
    if (preselectedAgentIds && preselectedAgentIds.length > 0) {
      setCustomAgentIds(preselectedAgentIds);
    }
  }, [preselectedAgentIds]);

  const activeQuickAction = QUICK_ACTIONS.find(a => a.id === selectedAction) || QUICK_ACTIONS[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedDocName(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      const content = typeof ev.target?.result === 'string' ? ev.target.result : '';
      setAttachedDocText(content || `[Archivo adjunto: ${file.name} (${file.type}, ${file.size} bytes)]`);
    };
    reader.readAsText(file);
  };

  const handleExecuteOrchestration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setActivePipelineIndex(0);

    // Animate pipeline progression while orchestrating
    const interval = setInterval(() => {
      setActivePipelineIndex(prev => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : prev));
    }, 320);

    try {
      const res = await fetch('/api/multiagent/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          actionType: selectedAction,
          jurisdictionContext,
          manualAgentIds: customAgentIds,
          teamId: selectedTeamId || undefined,
          attachedDocumentText: attachedDocText || undefined
        })
      });
      const data: MultiAgentOrchestrationResponse = await res.json();
      clearInterval(interval);
      setActivePipelineIndex(PIPELINE_STEPS.length - 1);
      setResult(data);
      setActiveResultTab('consolidado');

      // Save to history
      const updatedHistory = [data, ...historyList].slice(0, 20);
      setHistoryList(updatedHistory);
      localStorage.setItem('avd_multiagent_history', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('Error ejecutando orquestación multiagente:', err);
      clearInterval(interval);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = favoritesIds.includes(id)
      ? favoritesIds.filter(f => f !== id)
      : [...favoritesIds, id];
    setFavoritesIds(updated);
    localStorage.setItem('avd_multiagent_favorites', JSON.stringify(updated));
  };

  const handleCreateLegalCaseFromResult = () => {
    if (!result) return;
    const newCase: LegalCaseFile = {
      id: `CASO-${Date.now().toString().slice(-6)}`,
      caratula: `${result.classification.materiaPrincipal} — ${result.finalConsolidatedReport.titulo.slice(0, 70)}`,
      numeroExpediente: `AVD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      fuero: result.jurisdictionContext.fuero,
      juzgado: result.jurisdictionContext.tribunal || 'Juzgado a sortear',
      jurisdiccion: (result.jurisdictionContext.provincia as any) || 'Nacional / Federal',
      cliente: 'Consultante Titular (Memoria Confidencial Aislada)',
      contraparte: '[COMPLETAR: Contraparte identificada en el caso]',
      estadoProcesal: `Diagnóstico Multiagente (${result.participatingAgents.length} especialistas) — Nivel de Confianza: ${result.confidenceLevel}`,
      fechaInicio: new Date().toISOString().split('T')[0],
      proximoVencimiento: 'Verificar plazos de prescripción y caducidad en tabla cronológica',
      resumenHechos: result.finalConsolidatedReport.hechos,
      pretension: result.finalConsolidatedReport.recomendacion,
      documentosAdjuntos: [
        {
          id: `doc-${Date.now()}`,
          nombre: `Dictamen_Multiagente_${result.id}.md`,
          tipo: 'Dictamen Multiagente Consolidado',
          fecha: new Date().toISOString().split('T')[0],
          contenido: result.finalConsolidatedReport.borradorEscritoOContrato
        }
      ],
      actuaciones: result.agentContributions.map((c, idx) => ({
        id: `act-${idx}-${Date.now()}`,
        fecha: new Date().toISOString().split('T')[0],
        tipo: c.stage,
        descripcion: c.summary,
        responsable: `${c.agentEmoji} ${c.agentName}`
      })),
      notasInternas: [
        `MEMORIA CONFIDENCIAL AISLADA DEL CASO ${result.id}`,
        `Estrategia Recomendada: ${result.strategyMatrix.estrategiaRecomendada}`,
        `Plan B: ${result.strategyMatrix.planB}`,
        `Alerta Abogado del Diablo: ${result.devilAdvocate.riesgosProcesales.join(' | ')}`
      ]
    };

    // Save in localStorage cases too
    try {
      const existingRaw = localStorage.getItem('avd_custom_cases');
      const existing: LegalCaseFile[] = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('avd_custom_cases', JSON.stringify([newCase, ...existing]));
    } catch {
      // ignore
    }

    setCaseCreatedToast(`Caso Jurídico ${newCase.numeroExpediente} creado con Memoria Confidencial Aislada.`);
    setTimeout(() => setCaseCreatedToast(null), 4000);

    if (onConvertToCase) {
      onConvertToCase(newCase);
    }
  };

  const sampleCases = [
    {
      title: 'Despido tras 5 años sin registrar',
      action: 'ANALIZAR_CASO' as QuickActionType,
      text: 'Me despidieron verbalmente hoy después de trabajar cinco años en una empresa textil en CABA sin estar registrado ("en negro"). Cobraba en mano, cumplía horario de lunes a viernes de 9 a 18 hs y tengo mensajes de WhatsApp y testigos. ¿Qué equipo debe intervenir, qué intimación debo enviar y qué reclamo corresponde?'
    },
    {
      title: 'Incumplimiento contractual y daños',
      action: 'PREPARAR_DEMANDA' as QuickActionType,
      text: 'Firmé un contrato de obra con una constructora en Provincia de Buenos Aires para refaccionar un local comercial. Pagué el 70% de adelanto, abandonaron la obra hace 3 meses y me causaron lucro cesante por no poder abrir el local. Quiero preparar la demanda y pedir medida cautelar.'
    },
    {
      title: 'Auditoría de contrato de locación comercial',
      action: 'ANALIZAR_CONTRATO' as QuickActionType,
      text: 'Necesito revisar un contrato de locación comercial donde el locador impone renuncia anticipada a reclamar daños por filtraciones, mora automática con multa del 5% diario en dólares y facultad de rescisión unilateral sin indemnización.'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Institutional Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1836] via-[#0f1f44] to-[#142754] border-2 border-[#c5a059]/60 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none hidden lg:block">
          <Scale className="w-48 h-48 text-[#c5a059]" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#f3dfa2] text-[11px] font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" /> El Primer Estudio Jurídico Virtual Multiagente — Derecho Argentino
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#fdfbf7]">
              Estudio Jurídico Virtual Multiagente
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <em>"Le cuento mi problema a la Academia y la Academia arma el equipo jurídico adecuado para analizarlo."</em> El <strong>Director Jurídico IA (`legal-director`)</strong> diagnostica su caso, convoca a los especialistas de fondo y procesales, ordena la investigación normativa y jurisprudencial, somete la tesis al <strong>Abogado del Diablo</strong> y al <strong>Verificador Jurídico</strong>, y consolida el dictamen o escrito final.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenAgentsGallery && (
              <button
                onClick={onOpenAgentsGallery}
                className="px-4 py-2.5 rounded-xl bg-[#13254c] hover:bg-[#1a3163] border border-[#c5a059]/50 text-[#f3dfa2] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Users className="w-4 h-4 text-[#c5a059]" />
                <span>Galería de {ALL_LEGAL_AGENTS.length} Agentes y {LEGAL_TEAMS.length} Equipos</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Ethical & Deontological Banner */}
      <div className="rounded-xl bg-[#101d3b] border border-[#c5a059]/40 px-4 py-3 flex items-start gap-3 text-xs text-slate-200">
        <ShieldCheck className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#f3dfa2] uppercase tracking-wider text-[11px]">Aviso Deontológico y Regla de Veracidad: </span>
          <span>
            La información proporcionada por la inteligencia artificial tiene carácter informativo y de asistencia. No sustituye el asesoramiento, patrocinio ni representación de un abogado matriculado. La normativa y jurisprudencia deben verificarse antes de adoptar decisiones o presentar escritos. En asuntos urgentes o con plazos perentorios en curso, consulte de inmediato a un profesional matriculado.
          </span>
        </div>
      </div>

      {/* 12 Quick Action Buttons Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#c5a059] font-bold">
            1. Seleccione la Operación Jurídica (o describa directamente su caso)
          </h2>
          <span className="text-[11px] text-slate-400">
            El Director Jurídico seleccionará automáticamente los especialistas necesarios
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {QUICK_ACTIONS.map(action => {
            const isSelected = selectedAction === action.id;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => setSelectedAction(action.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#c5a059]/25 to-[#162955] border-[#c5a059] shadow-lg shadow-[#c5a059]/10'
                    : 'bg-[#0b152b] hover:bg-[#112042] border-[#1d2f5d] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg">{action.emoji}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>}
                </div>
                <div>
                  <div className={`text-[11px] font-bold tracking-wide ${isSelected ? 'text-[#f3dfa2]' : 'text-slate-100'}`}>
                    {action.label}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                    {action.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Argentine Jurisdiction Context & Input Form */}
      <form onSubmit={handleExecuteOrchestration} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Argentine Jurisdiction Context & Team Selector */}
        <div className="lg:col-span-4 bg-[#0b152b] border border-[#1d2f5d] rounded-2xl p-5 space-y-4">
          <div className="border-b border-[#1d2f5d] pb-3">
            <h3 className="font-serif font-bold text-sm text-[#fdfbf7] flex items-center gap-2">
              <span>🇦🇷</span>
              <span>2. Contexto Jurisdiccional Argentino</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Adapta el análisis a la normativa nacional, provincial o municipal y al rito local aplicable.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">País:</label>
              <input
                type="text"
                value={jurisdictionContext.pais}
                onChange={e => setJurisdictionContext({ ...jurisdictionContext, pais: e.target.value })}
                className="w-full bg-[#112042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Órbita / Competencia:</label>
              <select
                value={jurisdictionContext.tipoJurisdiccion}
                onChange={e =>
                  setJurisdictionContext({
                    ...jurisdictionContext,
                    tipoJurisdiccion: e.target.value as ArgentineJurisdictionContext['tipoJurisdiccion']
                  })
                }
                className="w-full bg-[#112042] text-slate-100 rounded-xl px-2.5 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              >
                <option value="Nacional">Nacional (CABA / Derecho Común)</option>
                <option value="Federal">Justicia Federal</option>
                <option value="Provincial">Justicia Provincial</option>
                <option value="Municipal">Órbita Municipal / Faltas</option>
                <option value="Internacional / DDHH">Internacional / CIDH - Corte IDH</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Provincia / Jurisdicción Local:</label>
            <select
              value={jurisdictionContext.provincia}
              onChange={e => setJurisdictionContext({ ...jurisdictionContext, provincia: e.target.value })}
              className="w-full bg-[#112042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
            >
              {ARGENTINE_PROVINCES.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Fuero:</label>
              <select
                value={jurisdictionContext.fuero}
                onChange={e => setJurisdictionContext({ ...jurisdictionContext, fuero: e.target.value })}
                className="w-full bg-[#112042] text-slate-100 rounded-xl px-2.5 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              >
                {FUEROS_LIST.map(f => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Ciudad / Departamento:</label>
              <input
                type="text"
                value={jurisdictionContext.ciudad}
                onChange={e => setJurisdictionContext({ ...jurisdictionContext, ciudad: e.target.value })}
                placeholder="Ej. La Plata, Rosario, Córdoba..."
                className="w-full bg-[#112042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Tribunal / Organismo (Opcional):</label>
            <input
              type="text"
              value={jurisdictionContext.tribunal}
              onChange={e => setJurisdictionContext({ ...jurisdictionContext, tribunal: e.target.value })}
              placeholder="Ej. Juzgado Nacional del Trabajo N° 15 / TFN..."
              className="w-full bg-[#112042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="pt-2 border-t border-[#1d2f5d] text-xs">
            <label className="block text-[#c5a059] font-semibold mb-1 text-[11px]">
              Equipo Jurídico (Opcional — Automático por defecto):
            </label>
            <select
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value)}
              className="w-full bg-[#112042] text-slate-100 rounded-xl px-3 py-2 border border-[#c5a059]/40 focus:outline-none focus:border-[#c5a059]"
            >
              <option value="">✨ Selección Automática por el Director Jurídico IA</option>
              {LEGAL_TEAMS.map(t => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.name} — {t.specialty}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right 8 Cols: Case / Query Input & Document Upload */}
        <div className="lg:col-span-8 bg-[#0b152b] border border-[#1d2f5d] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1d2f5d] pb-3">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#fdfbf7] flex items-center gap-2">
                  <span>{activeQuickAction.emoji}</span>
                  <span>3. {activeQuickAction.label}: Relato del Caso, Consulta o Escrito</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  No necesita saber qué agente elegir: describa los hechos y el Director Jurídico IA convocará a los especialistas.
                </p>
              </div>

              {/* Sample Cases Quick Fill */}
              <div className="flex flex-wrap gap-1.5">
                {sampleCases.map((sc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedAction(sc.action);
                      setQuery(sc.text);
                    }}
                    className="text-[10.5px] px-2.5 py-1 rounded-lg bg-[#13254c] hover:bg-[#1b3366] text-[#f3dfa2] border border-[#1d2f5d] transition-colors cursor-pointer"
                  >
                    Ej.: {sc.title}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={6}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={activeQuickAction.placeholderPrompt}
              className="w-full bg-[#081021] text-slate-100 rounded-xl p-4 text-xs sm:text-sm border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059] leading-relaxed resize-y"
            />

            {/* Document Attachment Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1b38] p-3 rounded-xl border border-[#1d2f5d]">
              <div className="flex items-center gap-2.5 text-xs">
                <Upload className="w-4 h-4 text-[#c5a059]" />
                <div>
                  <span className="font-semibold text-slate-200">Adjuntar Documento / Contrato / Pieza Procesal: </span>
                  <span className="text-slate-400 text-[11px]">
                    (TXT, MD, JSON, Contratos, Cédulas, Notificaciones)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-lg bg-[#162955] hover:bg-[#1e3770] text-xs font-semibold text-[#f3dfa2] border border-[#c5a059]/40 cursor-pointer transition-colors">
                  <span>Seleccionar archivo</span>
                  <input type="file" accept=".txt,.md,.json,.csv,.html,.doc,.docx,.pdf" onChange={handleFileUpload} className="hidden" />
                </label>
                {attachedDocName && (
                  <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                    📎 {attachedDocName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Flujo:</span>
              <span className="text-[#c5a059] font-mono">
                Director Jurídico → Especialistas → Investigadores → Abogado del Diablo → Verificador → Dictamen
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] font-serif font-bold text-xs sm:text-sm shadow-lg shadow-[#c5a059]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Orquestando Equipo Jurídico...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  <span>Activar Estudio Jurídico Multiagente</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Pipeline 9-Step Progress Visualizer */}
      {(loading || result) && (
        <div className="bg-[#0a1326] border border-[#1d2f5d] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#c5a059] font-bold">
              Trazabilidad del Proceso Multiagente (9 Etapas)
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {loading ? PIPELINE_STEPS[activePipelineIndex] : '✓ 9/9 Etapas Completadas y Verificadas'}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
            {PIPELINE_STEPS.map((step, idx) => {
              const isDone = !loading || idx <= activePipelineIndex;
              const isCurrent = loading && idx === activePipelineIndex;
              return (
                <div
                  key={step}
                  className={`px-2 py-2 rounded-lg text-[10px] font-mono text-center border transition-all ${
                    isCurrent
                      ? 'bg-[#c5a059] text-[#0b1325] font-bold border-[#f3dfa2] animate-pulse'
                      : isDone
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-[#0e1a33] text-slate-500 border-[#1d2f5d]'
                  }`}
                >
                  {step}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toast when converted to Legal Case */}
      {caseCreatedToast && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{caseCreatedToast}</span>
          </div>
        </div>
      )}

      {/* MULTI-AGENT ORCHESTRATION RESULT */}
      {result && (
        <div className="space-y-6">
          {/* Visual Architecture Diagram: Director -> Specialists -> Verifier -> Final */}
          <div className="bg-[#0b152b] border-2 border-[#c5a059]/50 rounded-2xl p-5 space-y-5 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1d2f5d] pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#c5a059]/20 text-[#f3dfa2] border border-[#c5a059]/40 text-[10.5px] font-mono uppercase font-bold">
                    {result.selectedTeamName}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10.5px] font-mono uppercase font-bold border ${
                      result.confidenceLevel === 'ALTO'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : result.confidenceLevel === 'MEDIO'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    NIVEL DE CONFIANZA: {result.confidenceLevel}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-white mt-1.5">
                  {result.finalConsolidatedReport.titulo}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">{result.confidenceExplanation}</p>
              </div>

              {/* Action Bar: Convert to Case & Export PDF / DOCX / TXT / MD */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateLegalCaseFromResult}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Convertir en Caso Jurídico</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleFavorite(result.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                    favoritesIds.includes(result.id)
                      ? 'bg-[#c5a059] text-[#0b1325] border-[#f3dfa2]'
                      : 'bg-[#122246] text-slate-200 border-[#1d2f5d] hover:border-[#c5a059]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{favoritesIds.includes(result.id) ? 'Guardado' : 'Favorito'}</span>
                </button>

                <div className="flex items-center rounded-xl bg-[#101e3d] border border-[#1d2f5d] p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => exportOrchestrationToPDF(result)}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-[#1a2f5e] text-[#f3dfa2] font-semibold flex items-center gap-1 cursor-pointer"
                    title="Exportar a PDF"
                  >
                    <Download className="w-3 h-3" /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => exportOrchestrationToDOCX(result)}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-[#1a2f5e] text-slate-200 font-semibold cursor-pointer"
                    title="Exportar a Word (DOCX)"
                  >
                    DOCX
                  </button>
                  <button
                    type="button"
                    onClick={() => exportOrchestrationToTXT(result)}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-[#1a2f5e] text-slate-200 font-semibold cursor-pointer"
                    title="Exportar a TXT"
                  >
                    TXT
                  </button>
                  <button
                    type="button"
                    onClick={() => exportOrchestrationToMarkdown(result)}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-[#1a2f5e] text-slate-200 font-semibold cursor-pointer"
                    title="Exportar a Markdown"
                  >
                    MD
                  </button>
                </div>
              </div>
            </div>

            {/* Hierarchical Multi-Agent Flowchart */}
            <div className="bg-[#081021] border border-[#1d2f5d] rounded-xl p-4">
              <div className="text-[10.5px] font-mono uppercase text-[#c5a059] text-center mb-3 tracking-widest">
                Arquitectura de Intervención Multiagente en este Caso
              </div>
              <div className="flex flex-col items-center space-y-2">
                {/* Level 1: Director */}
                <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#9b7832] text-[#0b1325] font-bold text-xs flex items-center gap-2 shadow-md">
                  <span>⚖️ DIRECTOR JURÍDICO IA (legal-director)</span>
                </div>
                <div className="text-[#c5a059] text-xs font-bold">↓</div>

                {/* Level 2: Specialist Agents */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {result.participatingAgents
                    .filter(a => a.id !== 'legal-director' && a.id !== 'legal-verifier')
                    .map(ag => (
                      <div
                        key={ag.id}
                        className="px-3 py-1.5 rounded-lg bg-[#112042] border border-[#c5a059]/40 text-xs text-slate-100 flex items-center gap-1.5"
                      >
                        <span>{ag.emoji}</span>
                        <span className="font-semibold">{ag.name}</span>
                      </div>
                    ))}
                </div>
                <div className="text-[#c5a059] text-xs font-bold">↓</div>

                {/* Level 3: Legal Verifier */}
                <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
                  <span>🔍 VERIFICADOR JURÍDICO IA (Control de Citas y Calidad)</span>
                </div>
                <div className="text-[#c5a059] text-xs font-bold">↓</div>

                {/* Level 4: Final Consolidated Result */}
                <div className="px-4 py-1.5 rounded-xl bg-[#162955] border border-[#f3dfa2]/60 text-[#f3dfa2] font-serif font-bold text-xs">
                  📜 DICTAMEN Y DOCUMENTO FINAL CONSOLIDADO
                </div>
              </div>
            </div>

            {/* Result Sub-Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-[#1d2f5d] pb-2">
              {[
                { id: 'consolidado', label: '📜 Dictamen Final (10 Secciones)' },
                { id: 'agentes', label: `👥 Intervención por Agente (${result.agentContributions.length})` },
                { id: 'epistemico', label: '🔍 Verificación Normativa y Jurisprudencia' },
                { id: 'estrategia', label: '♟️ Estrategia FODA + 😈 Abogado del Diablo' },
                { id: 'cronologia', label: '⏱️ Cronología y Plazos' },
                { id: 'borrador', label: '✍️ Borrador de Escrito / Contrato ([COMPLETAR])' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveResultTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeResultTab === tab.id
                      ? 'bg-[#c5a059] text-[#0b1325] font-bold shadow-sm'
                      : 'bg-[#101e3d] text-slate-300 hover:text-white border border-[#1d2f5d]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: DICTAMEN CONSOLIDADO (10 SECTIONS) */}
            {activeResultTab === 'consolidado' && (
              <div className="space-y-4">
                {/* Clarifying Questions Box from Legal Director */}
                <div className="bg-[#112042] border border-[#c5a059]/50 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-[#f3dfa2] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#c5a059]" />
                    <span>Preguntas Aclaratorias del Director Jurídico para Precisar el Caso:</span>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-200 list-disc list-inside">
                    {result.classification.preguntasAclaratorias.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>

                {/* 10 Professional Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { num: '1. Antecedentes', content: result.finalConsolidatedReport.antecedentes },
                    { num: '2. Hechos Relevados', content: result.finalConsolidatedReport.hechos },
                    { num: '3. Problema Jurídico', content: result.finalConsolidatedReport.problemaJuridico },
                    { num: '4. Normativa Aplicable', content: result.finalConsolidatedReport.normativaAplicable },
                    { num: '5. Jurisprudencia Identificada', content: result.finalConsolidatedReport.jurisprudencia },
                    { num: '6. Análisis Jurídico Integrado', content: result.finalConsolidatedReport.analisisJuridico },
                    { num: '7. Riesgos y Contraargumentos (Red Team)', content: result.finalConsolidatedReport.riesgosYContraargumentos },
                    { num: '8. Alternativas y Estrategia Procesal', content: result.finalConsolidatedReport.alternativasYEstrategia },
                    { num: '9. Recomendación Profesional', content: result.finalConsolidatedReport.recomendacion },
                    { num: '10. Conclusión Ejecutiva', content: result.finalConsolidatedReport.conclusion }
                  ].map(sec => (
                    <div key={sec.num} className="bg-[#081021] border border-[#1d2f5d] rounded-xl p-4 space-y-1.5">
                      <h4 className="font-serif font-bold text-xs text-[#f3dfa2] uppercase tracking-wider">
                        {sec.num}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{sec.content}</p>
                    </div>
                  ))}
                </div>

                {/* Final Pre-Filing Checklist */}
                <div className="bg-[#0e1b38] border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <h4 className="font-serif font-bold text-xs text-emerald-300 uppercase">
                    ✓ Checklist Final de Control antes de Presentar o Intimar
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.finalConsolidatedReport.checklistFinal.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERVENCIÓN INDIVIDUAL POR AGENTE */}
            {activeResultTab === 'agentes' && (
              <div className="space-y-3">
                {result.agentContributions.map(contrib => (
                  <div key={contrib.agentId} className="bg-[#081021] border border-[#1d2f5d] rounded-xl p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1d2f5d]/70 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{contrib.agentEmoji}</span>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#fdfbf7]">{contrib.agentName}</h4>
                          <p className="text-[11px] text-[#c5a059]">{contrib.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-[#122246] text-slate-300 text-[10px] font-mono">
                          Etapa: {contrib.stage}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-mono">
                          Entregable: {contrib.deliverableType}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-[#f3dfa2]">{contrib.summary}</p>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-[#0b152b] p-3 rounded-lg border border-[#1d2f5d]/60">
                      {contrib.detailedOutput}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: SEPARACIÓN EPISTÉMICA Y VERIFICACIÓN DE CITAS */}
            {activeResultTab === 'epistemico' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#081021] border border-[#1d2f5d] rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-[#f3dfa2] uppercase">
                      1. Información Aportada por el Usuario
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {result.epistemicSeparation.informacionAportadaPorUsuario.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#081021] border border-[#1d2f5d] rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-[#f3dfa2] uppercase">
                      2. Conocimiento Jurídico General
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {result.epistemicSeparation.conocimientoJuridicoGeneral.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Normativa Table */}
                <div className="bg-[#081021] border border-[#1d2f5d] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[#c5a059] uppercase">
                    3. Normativa Identificada y Auditada por el Verificador Jurídico
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#1d2f5d] text-slate-400 font-mono text-[10.5px]">
                          <th className="py-2 pr-3">ESTADO</th>
                          <th className="py-2 pr-3">NORMA</th>
                          <th className="py-2 pr-3">ARTÍCULOS</th>
                          <th className="py-2 pr-3">ÁMBITO</th>
                          <th className="py-2 pr-3">VIGENCIA / FUENTE</th>
                          <th className="py-2">RELEVANCIA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1d2f5d]/40 text-slate-200">
                        {result.epistemicSeparation.normativaIdentificada.map((n, i) => (
                          <tr key={i}>
                            <td className="py-2.5 pr-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  n.status === 'VERIFICADA'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {n.status}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3 font-semibold">{n.norma}</td>
                            <td className="py-2.5 pr-3 font-mono text-[#f3dfa2]">{n.articulo}</td>
                            <td className="py-2.5 pr-3">{n.ambito}</td>
                            <td className="py-2.5 pr-3 text-slate-400">
                              {n.vigencia} ({n.fuente})
                            </td>
                            <td className="py-2.5 text-slate-300">{n.relevancia}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Jurisprudencia Table */}
                <div className="bg-[#081021] border border-[#1d2f5d] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[#c5a059] uppercase">
                    4. Jurisprudencia Identificada (8 Campos Reglamentarios)
                  </h4>
                  <div className="space-y-3">
                    {result.epistemicSeparation.jurisprudenciaIdentificada.map((j, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#0b152b] border border-[#1d2f5d] text-xs space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-white">
                            {j.caratula} — <span className="text-[#c5a059]">{j.tribunal}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                            {j.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Fecha: {j.fecha} | Expediente/Cita: {j.expediente} | Tema: {j.tema} | Fuente: {j.fuente}
                        </div>
                        <p className="text-slate-200">
                          <strong>Criterio:</strong> {j.criterio}
                        </p>
                        <p className="text-slate-300">
                          <strong>Utilidad para el caso:</strong> {j.utilidadParaElCaso}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requires Verification */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase">
                    5. Extremos que Requieren Verificación Expresa por el Profesional
                  </h4>
                  <ul className="text-xs text-amber-100 space-y-1 list-disc list-inside">
                    {result.epistemicSeparation.informacionQueRequiereVerificacion.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: ESTRATEGIA PROCESAL + ABOGADO DEL DIABLO */}
            {activeResultTab === 'estrategia' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-300 uppercase">FORTALEZAS</h4>
                    <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                      {result.strategyMatrix.fortalezas.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-amber-300 uppercase">DEBILIDADES</h4>
                    <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                      {result.strategyMatrix.debilidades.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-rose-300 uppercase">RIESGOS PROCESALES</h4>
                    <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                      {result.strategyMatrix.riesgos.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-blue-300 uppercase">OPORTUNIDADES Y CONCILIACIÓN</h4>
                    <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                      {result.strategyMatrix.oportunidades.map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#081021] border border-[#c5a059]/50 rounded-xl p-4 space-y-1.5">
                    <h4 className="text-xs font-bold text-[#f3dfa2] uppercase">♟️ ESTRATEGIA RECOMENDADA (PLAN A)</h4>
                    <p className="text-xs text-slate-200 leading-relaxed">{result.strategyMatrix.estrategiaRecomendada}</p>
                  </div>
                  <div className="bg-[#081021] border border-[#1d2f5d] rounded-xl p-4 space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-300 uppercase">🛡️ PLAN B DE CONTINGENCIA</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{result.strategyMatrix.planB}</p>
                  </div>
                </div>

                {/* Devil's Advocate Red Team Box */}
                <div className="bg-[#180d18] border border-rose-500/40 rounded-xl p-4 space-y-3">
                  <h4 className="font-serif font-bold text-sm text-rose-300 flex items-center gap-2">
                    <span>😈</span>
                    <span>Auditoría Crítica del Abogado del Diablo IA (Simulación de Ataque de la Contraparte)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-black/30 border border-rose-500/20">
                      <div className="font-bold text-rose-300 mb-1">1. ¿Qué argumentará la contraparte?</div>
                      <p className="text-slate-300">{result.devilAdvocate.argumentosContraparte.join(' ')}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30 border border-rose-500/20">
                      <div className="font-bold text-rose-300 mb-1">2. ¿Qué excepción podría plantear?</div>
                      <p className="text-slate-300">{result.devilAdvocate.excepcionesPosibles.join(' ')}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30 border border-rose-500/20">
                      <div className="font-bold text-rose-300 mb-1">3. ¿Qué prueba falta?</div>
                      <p className="text-slate-300">{result.devilAdvocate.pruebasFaltantes.join(' ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CRONOLOGÍA Y PLAZOS */}
            {activeResultTab === 'cronologia' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Advertencia sobre Plazos Procesales:</strong> Ningún plazo jurídico debe considerarse definitivo sin verificar el Código Procesal local ({result.jurisdictionContext.provincia}), feriados nacionales/provinciales e inhábiles judiciales decretados por el tribunal.
                  </span>
                </div>

                <div className="overflow-x-auto bg-[#081021] border border-[#1d2f5d] rounded-xl p-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#1d2f5d] text-[#c5a059] font-mono text-[10.5px]">
                        <th className="py-2 pr-3">FECHA</th>
                        <th className="py-2 pr-3">HECHO</th>
                        <th className="py-2 pr-3">DOCUMENTO</th>
                        <th className="py-2 pr-3">IMPORTANCIA</th>
                        <th className="py-2 pr-3">PRUEBA</th>
                        <th className="py-2">ALERTA DE PLAZO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1d2f5d]/40 text-slate-200">
                      {result.chronology.map((c, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 pr-3 font-mono text-[#f3dfa2]">{c.fecha}</td>
                          <td className="py-2.5 pr-3 font-semibold">{c.hecho}</td>
                          <td className="py-2.5 pr-3">{c.documentoRelacionado}</td>
                          <td className="py-2.5 pr-3">
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">
                              {c.importancia}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3">{c.pruebaVinculada}</td>
                          <td className="py-2.5 text-amber-300">{c.alertaPlazo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: BORRADOR FORENSE / CONTRATO ([COMPLETAR]) */}
            {activeResultTab === 'borrador' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f3dfa2]">
                    Borrador elaborado por Legal Writer IA / Especialista (Los datos no provistos figuran como [COMPLETAR])
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (result.finalConsolidatedReport.borradorEscritoOContrato) {
                        navigator.clipboard.writeText(result.finalConsolidatedReport.borradorEscritoOContrato);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#122246] hover:bg-[#192f5e] text-xs text-[#f3dfa2] border border-[#c5a059]/40 cursor-pointer"
                  >
                    Copiar Borrador
                  </button>
                </div>
                <pre className="bg-[#060c19] border border-[#c5a059]/40 rounded-xl p-5 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-[540px] overflow-y-auto">
                  {result.finalConsolidatedReport.borradorEscritoOContrato}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History & Favorites Section */}
      {historyList.length > 0 && (
        <div className="bg-[#0b152b] border border-[#1d2f5d] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#fdfbf7] flex items-center gap-2">
              <History className="w-4 h-4 text-[#c5a059]" />
              <span>Historial de Dictámenes Multiagente y Favoritos ({historyList.length})</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {historyList.slice(0, 6).map(item => (
              <div
                key={item.id}
                onClick={() => setResult(item)}
                className="p-3.5 rounded-xl bg-[#081021] hover:bg-[#101e3d] border border-[#1d2f5d] hover:border-[#c5a059]/60 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{new Date(item.timestamp).toLocaleDateString('es-AR')}</span>
                  <span className="text-[#c5a059] font-bold">{item.confidenceLevel}</span>
                </div>
                <div className="text-xs font-bold text-slate-100 truncate">
                  {item.finalConsolidatedReport.titulo}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{item.query}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
