import React, { useState } from 'react';
import {
  Users,
  Search,
  Sparkles,
  MessageSquare,
  UserPlus,
  Check,
  X,
  Send,
  RefreshCw,
  ShieldCheck,
  FileText,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Trash2,
  Scale
} from 'lucide-react';
import {
  ALL_LEGAL_AGENTS,
  LEGAL_TEAMS,
  LegalAgentDefinition,
  AgentFolder
} from '../agents/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface AgentGalleryProps {
  onConsultAgent?: (agent: LegalAgentDefinition) => void;
  onTeamChange?: (teamAgents: LegalAgentDefinition[]) => void;
  onLaunchMultiAgentStudio?: (selectedAgentIds: string[], initialQuery?: string) => void;
}

const FOLDER_LABELS: Record<AgentFolder | 'all', string> = {
  all: 'Todos los Especialistas (27)',
  orchestration: 'Dirección & Orquestación',
  legal: 'Abogados & Consultoría General',
  civil: 'Civil, Comercial, Familia & Sucesiones',
  penal: 'Penal & Procesal Penal',
  laboral: 'Laboral, Procesal & Previsional',
  tributario: 'Tributario & Contencioso Fiscal',
  publico: 'Constitucional, DD.HH. & Administrativo',
  especialidades: 'Consumidor, Ambiental, Digital & PI',
  litigacion: 'Redacción, Demandas & Estrategia',
  investigacion: 'Investigación Normativa & Fallos',
  documentos: 'Análisis Documental & Cronologías',
  control: 'Abogado del Diablo & Verificación',
  academico: 'Docencia & Casos Prácticos'
};

export const AgentGallery: React.FC<AgentGalleryProps> = ({
  onConsultAgent,
  onTeamChange,
  onLaunchMultiAgentStudio
}) => {
  const { activeJurisdiction } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState<AgentFolder | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Team Builder State ("Agregar al Equipo")
  const [teamAgentIds, setTeamAgentIds] = useState<string[]>(['legal-director']);
  const [teamConsultationOpen, setTeamConsultationOpen] = useState(false);
  const [teamQuery, setTeamQuery] = useState('');
  const [isRunningTeam, setIsRunningTeam] = useState(false);
  const [teamResponse, setTeamResponse] = useState<string | null>(null);

  // Direct Agent Consultation Modal State ("Consultar Agente")
  const [activeAgentChat, setActiveAgentChat] = useState<LegalAgentDefinition | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'agent'; text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Full Profile Modal State
  const [inspectedAgent, setInspectedAgent] = useState<LegalAgentDefinition | null>(null);

  const filteredAgents = ALL_LEGAL_AGENTS.filter((agent) => {
    const matchesFolder = selectedFolder === 'all' || agent.folder === selectedFolder;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      agent.name.toLowerCase().includes(q) ||
      agent.specialty.toLowerCase().includes(q) ||
      agent.role.toLowerCase().includes(q) ||
      agent.areas.some((a) => a.toLowerCase().includes(q));
    return matchesFolder && matchesSearch;
  });

  const handleToggleTeamAgent = (agent: LegalAgentDefinition) => {
    setTeamAgentIds((prev) => {
      const exists = prev.includes(agent.id);
      const next = exists ? prev.filter((id) => id !== agent.id) : [...prev, agent.id];
      if (onTeamChange) {
        const resolved = next
          .map((id) => ALL_LEGAL_AGENTS.find((a) => a.id === id))
          .filter((a): a is LegalAgentDefinition => !!a);
        onTeamChange(resolved);
      }
      return next;
    });
  };

  const handleOpenConsultAgent = (agent: LegalAgentDefinition) => {
    if (onConsultAgent) {
      onConsultAgent(agent);
    }
    setActiveAgentChat(agent);
    setChatHistory([]);
    setChatMessage('');
  };

  const handleSendDirectConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgentChat || !chatMessage.trim() || isChatLoading) return;

    const userText = chatMessage.trim();
    setChatMessage('');
    setChatHistory((prev) => [...prev, { role: 'user', text: userText }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/multiagent/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: activeAgentChat.id,
          message: userText,
          jurisdiction: activeJurisdiction
        })
      });
      const data = await res.json();
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          text: data.reply || 'No se pudo obtener respuesta del agente especialista.'
        }
      ]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          text: 'Error de conexión al consultar con el agente jurídico.'
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRunTeamOrchestration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamQuery.trim() || isRunningTeam) return;

    if (onLaunchMultiAgentStudio) {
      onLaunchMultiAgentStudio(teamAgentIds, teamQuery);
      return;
    }

    setIsRunningTeam(true);
    setTeamResponse(null);

    try {
      const res = await fetch('/api/multiagent/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: teamQuery,
          actionType: 'CONSULTA_JURIDICA',
          jurisdiction: activeJurisdiction,
          manualAgentIds: teamAgentIds
        })
      });
      const data = await res.json();
      setTeamResponse(
        data.result?.finalIntegratedDocument ||
          data.result?.executiveSummary ||
          'Dictamen multiagente procesado correctamente.'
      );
    } catch (err) {
      console.error(err);
      setTeamResponse('Error al ejecutar la mesa de trabajo con el equipo seleccionado.');
    } finally {
      setIsRunningTeam(false);
    }
  };

  const assembledAgents = teamAgentIds
    .map((id) => ALL_LEGAL_AGENTS.find((a) => a.id === id))
    .filter((a): a is LegalAgentDefinition => !!a);

  return (
    <div className="space-y-6">
      {/* Top Active Team Bar ("Equipo Jurídico Ensamblado") */}
      <div className="bg-gradient-to-r from-[#0d1832] via-[#101f3e] to-[#0c162e] border border-[#c5a059]/40 rounded-2xl p-4 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#f3dfa2] text-[11px] font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" /> Equipo del Caso ({assembledAgents.length} agentes)
              </span>
              <span className="text-xs text-slate-400">
                Seleccioná especialistas con el botón <strong className="text-slate-200">"Agregar al Equipo"</strong>
              </span>
            </div>

            {/* Pills of selected agents */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
              {assembledAgents.map((member) => (
                <span
                  key={member.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#091224] border border-[#1d2f5d] text-xs text-slate-200"
                >
                  <span>{member.avatarEmoji}</span>
                  <span className="font-medium">{member.name}</span>
                  {member.id !== 'legal-director' && (
                    <button
                      type="button"
                      onClick={() => handleToggleTeamAgent(member)}
                      className="text-slate-500 hover:text-rose-400 ml-1"
                      title="Quitar del equipo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              onChange={(e) => {
                if (!e.target.value) return;
                const preset = LEGAL_TEAMS.find((t) => t.id === e.target.value);
                if (preset) {
                  setTeamAgentIds(preset.memberAgentIds);
                }
              }}
              defaultValue=""
              className="bg-[#091224] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
            >
              <option value="" disabled>
                Cargar Equipo Preconfigurado...
              </option>
              {LEGAL_TEAMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.iconEmoji} {t.name} ({t.memberAgentIds.length})
                </option>
              ))}
            </select>

            {assembledAgents.length > 1 && (
              <button
                type="button"
                onClick={() => setTeamAgentIds(['legal-director'])}
                className="px-3 py-2 rounded-xl bg-[#122042] hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-[#1d2f5d] text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpiar
              </button>
            )}

            <button
              type="button"
              onClick={() => setTeamConsultationOpen(!teamConsultationOpen)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sesionar con el Equipo ({assembledAgents.length})</span>
            </button>
          </div>
        </div>

        {/* Collapsible Team Joint Consultation Box */}
        {teamConsultationOpen && (
          <div className="mt-4 pt-4 border-t border-[#1d2f5d] space-y-3">
            <form onSubmit={handleRunTeamOrchestration} className="space-y-3">
              <label className="block text-xs font-serif font-bold text-[#f3dfa2]">
                Plantee el caso o consulta jurídica para el Equipo Multiagente seleccionado:
              </label>
              <textarea
                rows={3}
                value={teamQuery}
                onChange={(e) => setTeamQuery(e.target.value)}
                placeholder="Describa los hechos, pretensiones o cláusulas para que el Director Jurídico IA coordine a los especialistas de su equipo..."
                className="w-full bg-[#081020] text-slate-100 text-xs rounded-xl p-3 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTeamConsultationOpen(false)}
                  className="px-3 py-2 rounded-xl bg-[#122042] text-slate-300 text-xs"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={isRunningTeam || !teamQuery.trim()}
                  className="px-4 py-2 rounded-xl bg-[#c5a059] text-[#0b1325] font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isRunningTeam ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Ejecutando Orquestación...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Ejecutar Dictamen en Equipo
                    </>
                  )}
                </button>
              </div>
            </form>

            {teamResponse && (
              <div className="p-4 rounded-xl bg-[#070e1c] border border-[#c5a059]/40 text-xs text-slate-200 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto leading-relaxed">
                {teamResponse}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search & Folder Category Filter Bar */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar agente por especialidad, fuero o materia..."
              className="w-full bg-[#081020] text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
            />
          </div>
          <div className="text-xs text-slate-400">
            Mostrando <strong className="text-[#c5a059]">{filteredAgents.length}</strong> de{' '}
            <strong>{ALL_LEGAL_AGENTS.length}</strong> agentes especializados
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(Object.keys(FOLDER_LABELS) as (AgentFolder | 'all')[]).map((folder) => (
            <button
              key={folder}
              type="button"
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedFolder === folder
                  ? 'bg-[#c5a059] text-[#0b1325] font-bold shadow-xs'
                  : 'bg-[#111f3f] text-slate-300 hover:text-white border border-[#1d2f5d]'
              }`}
            >
              {FOLDER_LABELS[folder]}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => {
          const isAddedToTeam = teamAgentIds.includes(agent.id);
          return (
            <div
              key={agent.id}
              className={`bg-[#0c162e] rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
                isAddedToTeam
                  ? 'border-[#c5a059] bg-gradient-to-b from-[#112042] to-[#0c162e]'
                  : 'border-[#1d2f5d] hover:border-[#c5a059]/60'
              }`}
            >
              <div>
                {/* Card Top Header: Emoji + Specialty Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-inner shrink-0"
                      style={{
                        backgroundColor: `${agent.accentColor}15`,
                        borderColor: `${agent.accentColor}45`
                      }}
                    >
                      {agent.avatarEmoji}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#132347] text-[#e5c378] border border-[#c5a059]/30">
                        {agent.folder.toUpperCase()}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#fdfbf7] mt-1 leading-snug">
                        {agent.name}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectedAgent(agent)}
                    className="text-[11px] text-slate-400 hover:text-[#c5a059] underline whitespace-nowrap"
                  >
                    Ficha IA
                  </button>
                </div>

                {/* Specialty */}
                <div className="mb-2.5">
                  <div className="text-[11px] font-semibold text-[#c5a059] uppercase tracking-wide">
                    Especialidad:
                  </div>
                  <p className="text-xs font-medium text-slate-200 leading-snug">
                    {agent.specialty}
                  </p>
                </div>

                {/* Mission excerpt */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {agent.mission}
                </p>

                {/* Areas Pills */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {agent.areas.slice(0, 4).map((area, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#081020] text-slate-300 border border-[#1d2f5d]"
                    >
                      {area}
                    </span>
                  ))}
                  {agent.areas.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                      +{agent.areas.length - 4} más
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: 'Consultar Agente' & 'Agregar al Equipo' */}
              <div className="pt-3 border-t border-[#1d2f5d]/80 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenConsultAgent(agent)}
                  className="px-3 py-2 rounded-xl bg-[#132347] hover:bg-[#192f5e] text-[#f3dfa2] border border-[#c5a059]/40 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Consultar Agente</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleTeamAgent(agent)}
                  className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isAddedToTeam
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325]'
                  }`}
                >
                  {isAddedToTeam ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>En el Equipo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Agregar al Equipo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Direct Agent Consultation ("Consultar Agente") */}
      {activeAgentChat && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0c162e] border border-[#c5a059]/50 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#091224] border-b border-[#1d2f5d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeAgentChat.avatarEmoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-[#fdfbf7]">
                      {activeAgentChat.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#c5a059]/20 text-[#f3dfa2] font-mono">
                      {activeAgentChat.specialty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{activeAgentChat.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAgentChat(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#122042]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#081020]">
              <div className="p-3.5 rounded-xl bg-[#0f1d3a] border border-[#1d2f5d] text-xs text-slate-200 space-y-1.5">
                <div className="font-semibold text-[#c5a059]">
                  {activeAgentChat.name} — {activeAgentChat.specialty}
                </div>
                <p className="text-slate-300 leading-relaxed">{activeAgentChat.mission}</p>
                <div className="pt-1 text-[11px] text-slate-400">
                  Preguntas habituales de encuadre: {activeAgentChat.questionsToAsk.slice(0, 2).join(' • ')}
                </div>
              </div>

              {chatHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                    item.role === 'user'
                      ? 'bg-[#172a52] text-white ml-8 border border-[#2a437e]'
                      : 'bg-[#0c162e] text-slate-200 mr-4 border border-[#c5a059]/30'
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#c5a059] mb-1">
                    {item.role === 'user' ? 'Tu Consulta' : activeAgentChat.name}
                  </div>
                  {item.text}
                </div>
              ))}

              {isChatLoading && (
                <div className="p-3.5 rounded-xl bg-[#0c162e] border border-[#1d2f5d] text-xs text-[#c5a059] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{activeAgentChat.name} está elaborando el dictamen...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendDirectConsultation}
              className="p-3.5 bg-[#091224] border-t border-[#1d2f5d] flex items-center gap-2"
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={`Escribir consulta directa para ${activeAgentChat.name}...`}
                className="flex-1 bg-[#0c162e] text-slate-100 text-xs rounded-xl px-3.5 py-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatMessage.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a68138] text-[#0b1325] font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Full Professional Agent Architecture ("Ficha IA") */}
      {inspectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0c162e] border border-[#c5a059]/50 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#1d2f5d] pb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{inspectedAgent.avatarEmoji}</span>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#fdfbf7]">
                    {inspectedAgent.name}
                  </h3>
                  <p className="text-xs text-[#c5a059] font-medium">
                    {inspectedAgent.specialty} • {inspectedAgent.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedAgent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#091224] border border-[#1d2f5d]">
                <div className="font-bold text-[#c5a059] mb-1">IDENTIDAD & PERSONALIDAD</div>
                <p className="text-slate-300">{inspectedAgent.identity}</p>
                <p className="text-slate-400 mt-1">{inspectedAgent.personality}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#091224] border border-[#1d2f5d]">
                <div className="font-bold text-[#c5a059] mb-1">EXPERIENCIA & MISIÓN</div>
                <p className="text-slate-300">{inspectedAgent.experience}</p>
                <p className="text-slate-400 mt-1">{inspectedAgent.mission}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#091224] border border-[#1d2f5d]">
                <div className="font-bold text-[#c5a059] mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> FLUJO DE TRABAJO
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  {inspectedAgent.workflow.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ol>
              </div>
              <div className="p-3 rounded-xl bg-[#091224] border border-[#1d2f5d]">
                <div className="font-bold text-[#c5a059] mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> ENTREGABLES & CALIDAD
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {inspectedAgent.deliverables.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#091224] border border-[#1d2f5d]">
                <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> ERRORES QUE EVITA
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {inspectedAgent.errorsToAvoid.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-xl bg-[#091224] border border-[#1d2f5d]">
                <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" /> CUÁNDO DERIVA A OTRO AGENTE
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {inspectedAgent.whenToDelegate.map((del, i) => (
                    <li key={i}>{del}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const target = inspectedAgent;
                  setInspectedAgent(null);
                  handleOpenConsultAgent(target);
                }}
                className="px-4 py-2 rounded-xl bg-[#c5a059] text-[#0b1325] font-bold text-xs"
              >
                Consultar a {inspectedAgent.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
