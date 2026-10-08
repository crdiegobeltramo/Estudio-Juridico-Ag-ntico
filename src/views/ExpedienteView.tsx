import React, { useState } from 'react';
import { 
  FolderGit2, 
  FileText, 
  Clock, 
  Sparkles, 
  Upload, 
  Bot, 
  Search, 
  CheckCircle2, 
  ChevronRight,
  AlertTriangle,
  History,
  FileCheck
} from 'lucide-react';
import { LegalCaseFile } from '../types/index.ts';

interface ExpedienteViewProps {
  initialCase?: LegalCaseFile | null;
}

export const ExpedienteView: React.FC<ExpedienteViewProps> = ({ initialCase }) => {
  const [selectedCase, setSelectedCase] = useState<LegalCaseFile>(initialCase || {
    id: 'exp-2026-001',
    caratula: 'Pérez, Mariana Lucía c/ Transporte Metropolitano S.A. s/ Daños y Perjuicios',
    numeroExpediente: 'EXP-10482/2025',
    fuero: 'Civil y Comercial Federal',
    juzgado: 'Juzgado Nacional en lo Civil y Comercial Federal N° 4, Secretaría N° 8',
    jurisdiccion: 'Nacional / Federal',
    cliente: 'Mariana Lucía Pérez (DNI 34.892.114)',
    contraparte: 'Transporte Metropolitano S.A.',
    estadoProcesal: 'Apertura a prueba - Pericial médica pendiente',
    fechaInicio: '2025-04-12',
    proximoVencimiento: '2026-10-15 (Plazo de 5 días para impugnar pericia médica)',
    resumenHechos: 'La actora sufrió politraumatismos severos al descender de la unidad de transporte público en parada autorizada debido a arranque intempestivo con puertas abiertas.',
    pretension: 'Reclamo resarcitorio integral fundado en los arts. 1708, 1716, 1722 y 1757 del CCCN, más ley 24.240 de Defensa del Consumidor.',
    documentosAdjuntos: [
      { id: 'doc-adj-1', nombre: 'Demanda_Inicial_Perez_vs_Transporte.pdf', tipo: 'Demanda', fecha: '2025-04-12' },
      { id: 'doc-adj-2', nombre: 'Contestacion_Demanda_Transporte_SA.pdf', tipo: 'Contestación', fecha: '2025-06-20' },
      { id: 'doc-adj-3', nombre: 'Dictamen_Pericial_Medico_Traumatologia.pdf', tipo: 'Pericia', fecha: '2026-08-30' }
    ],
    actuaciones: [
      { id: 'act-1', fecha: '2025-04-12', tipo: 'Presentación', descripcion: 'Interposición de demanda resarcitoria y ofrecimiento de prueba.', responsable: 'Dra. Luciana Cervelli' },
      { id: 'act-2', fecha: '2025-06-20', tipo: 'Procesal', descripcion: 'La demandada contesta oponiendo culpa de la víctima.', responsable: 'Estudio Jurídico Rivadavia' },
      { id: 'act-3', fecha: '2026-08-30', tipo: 'Pericial', descripcion: 'Presentación de pericia médica determinando un 18% de incapacidad física parcial y permanente.', responsable: 'Dr. Roberto Carrizo (Perito Oficial)' }
    ],
    notasInternas: [
      'Recordar solicitar traslado de la pericia y preparar ampliación de rubro incapacidad sobreviniente.',
      'Citar fallo CSJN "Aquino" y precedentes de la Cámara Nacional en lo Civil sobre cuantificación por fórmula Méndez/Vuotto.'
    ]
  });

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAskExpediente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAiAnalysis(null);

    const fullExpedienteContext = `EXPEDIENTE: ${selectedCase.numeroExpediente} - ${selectedCase.caratula}
JUZGADO: ${selectedCase.juzgado}
HECHOS: ${selectedCase.resumenHechos}
PRETENSIÓN: ${selectedCase.pretension}
ACTUACIONES RECIENTES:
${selectedCase.actuaciones.map(a => `- [${a.fecha}] (${a.tipo}): ${a.descripcion}`).join('\n')}
DOCUMENTOS ADJUNTOS: ${selectedCase.documentosAdjuntos.map(d => d.nombre).join(', ')}`;

    try {
      const res = await fetch('/api/gemini/analyze-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docText: `${fullExpedienteContext}\n\nCONSULTA ESPECÍFICA SOBRE EL EXPEDIENTE: ${aiQuestion}`,
          docType: 'expediente judicial'
        })
      });

      const data = await res.json();
      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setAiAnalysis('Error al analizar las piezas del expediente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c378] text-xs font-semibold uppercase tracking-wider mb-2">
              <FolderGit2 className="w-3.5 h-3.5" /> Expediente Digital Inteligente
            </div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#fdfbf7]">
              {selectedCase.caratula}
            </h1>
            <p className="mt-1 text-xs text-slate-300 font-mono">
              {selectedCase.numeroExpediente} • {selectedCase.juzgado}
            </p>
          </div>

          <div className="text-xs bg-[#101e3d] p-3 rounded-xl border border-[#1d2f5d] self-start space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Cliente:</span>
              <span className="font-semibold text-slate-200">{selectedCase.cliente}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Estado:</span>
              <span className="font-semibold text-amber-300">{selectedCase.estadoProcesal}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dossier, Actuaciones & Documentos (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cronología de Actuaciones Procesales */}
          <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#fdfbf7] flex items-center gap-2">
              <History className="w-4 h-4 text-[#c5a059]" /> Cronología Documental & Actuaciones de Autos
            </h3>

            <div className="relative border-l-2 border-[#1d2f5d] ml-3 space-y-5 pl-5 py-1">
              {selectedCase.actuaciones.map((act) => (
                <div key={act.id} className="relative group text-xs">
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#c5a059] border-2 border-[#0c162e]"></div>
                  <div className="p-3.5 rounded-xl bg-[#0a1429] border border-[#1d2f5d] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[#e5c378] font-bold text-[10.5px]">
                        {act.fecha} • {act.tipo}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{act.responsable}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11.5px]">
                      {act.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documentos Adjuntos del Expediente */}
          <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#fdfbf7] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" /> Piezas & Escritos Procesales Digitalizados
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedCase.documentosAdjuntos.map((doc) => (
                <div key={doc.id} className="p-3 bg-[#0a1429] border border-[#1d2f5d] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#c5a059] shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-slate-200 truncate">{doc.nombre}</p>
                      <span className="text-[10px] text-slate-400">{doc.tipo} • {doc.fecha}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                    PDF Verificado
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Expediente Q&A Assistant (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[650px]">
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="border-b border-[#1d2f5d] pb-3">
              <span className="font-serif font-bold text-sm text-[#fdfbf7] flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#c5a059]" /> Asistente de Análisis de este Expediente
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Consulte sobre hechos controvertidos, carga de la prueba, contingencias procesales o plazos pendientes.
              </p>
            </div>

            {aiAnalysis ? (
              <div className="p-4 bg-[#0a1429] rounded-xl border border-[#1d2f5d] space-y-3 text-xs leading-relaxed text-slate-200">
                <div className="font-bold text-[#c5a059] flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5" /> Dictamen Forense del Expediente:
                </div>
                <div className="whitespace-pre-wrap font-sans text-[11.5px]">
                  {aiAnalysis}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
                <Bot className="w-8 h-8 text-[#1d2f5d] mb-2" />
                <p>Formula una pregunta sobre el estado o prueba del expediente para que la IA elabore un informe estructurado.</p>
                <div className="mt-4 flex flex-col gap-1.5 w-full">
                  <button
                    onClick={() => setAiQuestion('¿Cuáles son las contingencias probatorias de la pericia médica traumatológica respecto a la incapacidad?')}
                    className="p-2 rounded bg-[#101e3d] text-slate-300 hover:text-white text-left text-[11px] border border-[#1d2f5d]"
                  >
                    • Contingencias de la pericia médica
                  </button>
                  <button
                    onClick={() => setAiQuestion('¿Qué defensas opuso la demandada y sobre quién recae la carga de la prueba según el CCCN?')}
                    className="p-2 rounded bg-[#101e3d] text-slate-300 hover:text-white text-left text-[11px] border border-[#1d2f5d]"
                  >
                    • Carga probatoria y defensas de la contraria
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleAskExpediente} className="pt-3 border-t border-[#1d2f5d] space-y-2">
            <div className="relative">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Preguntar sobre los autos..."
                className="w-full bg-[#122042] text-slate-100 placeholder-slate-400 text-xs rounded-xl px-3 py-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                disabled={isAnalyzing}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Identifica piezas del expediente sin inferir plazos definitivos</span>
              <button
                type="submit"
                disabled={!aiQuestion.trim() || isAnalyzing}
                className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] disabled:opacity-40 text-[#0b1325] px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1"
              >
                <span>{isAnalyzing ? 'Analizando...' : 'Consultar'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
