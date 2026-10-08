import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Send
} from 'lucide-react';
import {
  ALL_LEGAL_AGENTS,
  LEGAL_TEAMS,
  getAgentById
} from '../agents/index.ts';
import { AgentGallery } from '../components/AgentGallery.tsx';
import { CartaDocumentoBuilder } from '../components/CartaDocumentoBuilder.tsx';

interface AgentsGalleryViewProps {
  onLaunchWithAgent?: (agentId: string) => void;
  onLaunchWithTeam?: (teamId: string) => void;
}

export const AgentsGalleryView: React.FC<AgentsGalleryViewProps> = ({
  onLaunchWithAgent,
  onLaunchWithTeam
}) => {
  const [viewMode, setViewMode] = useState<'agents' | 'carta_documento' | 'teams'>('agents');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1836] via-[#0f1f44] to-[#142754] border-2 border-[#c5a059]/60 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#f3dfa2] text-[11px] font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" /> Arquitectura Modular de Especialistas — Derecho Argentino
            </div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#fdfbf7]">
              Directorio del Estudio Jurídico Multiagente ({ALL_LEGAL_AGENTS.length} Especialistas IA)
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
              Cada agente cuenta con identidad profesional, personalidad, misión, flujo de trabajo, entregables, criterios de calidad y reglas de derivación. Consultá un especialista individual o ensamblá tu propio equipo jurídico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-[#091224] p-1.5 rounded-xl border border-[#1d2f5d] self-start">
            <button
              type="button"
              onClick={() => setViewMode('agents')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'agents'
                  ? 'bg-[#c5a059] text-[#0b1325]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Agentes Especializados ({ALL_LEGAL_AGENTS.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('carta_documento')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'carta_documento'
                  ? 'bg-[#c5a059] text-[#0b1325]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Carta Documento & Escritos (DOC/PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('teams')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'teams'
                  ? 'bg-[#c5a059] text-[#0b1325]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Equipos Preconfigurados ({LEGAL_TEAMS.length})
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'agents' ? (
        <AgentGallery
          onConsultAgent={(agent) => {
            if (onLaunchWithAgent) {
              onLaunchWithAgent(agent.id);
            }
          }}
          onOpenCartaDocumento={() => setViewMode('carta_documento')}
        />
      ) : viewMode === 'carta_documento' ? (
        <CartaDocumentoBuilder />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEGAL_TEAMS.map((team) => {
            const members = team.memberAgentIds
              .map((id) => getAgentById(id))
              .filter(Boolean);
            return (
              <div
                key={team.id}
                className="bg-[#0c162e] border border-[#1d2f5d] hover:border-[#c5a059]/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{team.emoji}</span>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#c5a059]/15 text-[#e5c378] border border-[#c5a059]/30">
                          {team.specialty}
                        </span>
                        <h3 className="font-serif font-bold text-base text-[#fdfbf7] mt-1">
                          {team.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {team.description}
                  </p>

                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#c5a059] mb-1.5">
                      Especialistas Integrantes ({members.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {members.map((m) => (
                        <span
                          key={m!.id}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#091224] border border-[#1d2f5d] text-slate-200"
                        >
                          <span>{m!.emoji}</span>
                          <span>{m!.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {onLaunchWithTeam && (
                  <div className="pt-3 border-t border-[#1d2f5d] flex justify-end">
                    <button
                      type="button"
                      onClick={() => onLaunchWithTeam(team.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a68138] text-[#0b1325] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Convocar Equipo en Mesa Orquestadora</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
