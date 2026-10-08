import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  Plus, 
  Clock, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Calculator,
  Users,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { LegalCaseFile } from '../types/index.ts';
import { AgentGallery } from '../components/AgentGallery.tsx';
import { CartaDocumentoBuilder } from '../components/CartaDocumentoBuilder.tsx';
import { exportLegalDraftToDOC, exportLegalDraftToPDF } from '../utils/exportDocuments.ts';

interface LawFirmViewProps {
  onSelectCase?: (caseFile: LegalCaseFile) => void;
  onOpenMultiAgentStudio?: () => void;
}

export const LawFirmView: React.FC<LawFirmViewProps> = ({ onSelectCase, onOpenMultiAgentStudio }) => {
  const { activeJurisdiction } = useAuth();
  const [cases, setCases] = useState<LegalCaseFile[]>([]);
  const [activeTab, setActiveTab] = useState<'agentes' | 'carta_documento' | 'expedientes' | 'redactor' | 'plazos'>('agentes');

  // Procedural Drafter State
  const [tipoEscrito, setTipoEscrito] = useState('Demanda Ordinaria por Daños y Perjuicios');
  const [fueroEscrito, setFueroEscrito] = useState('Civil y Comercial Federal');
  const [clienteNombre, setClienteNombre] = useState('Mariana Lucía Pérez');
  const [contraparteNombre, setContraparteNombre] = useState('Transporte Metropolitano S.A.');
  const [hechosEscrito, setHechosEscrito] = useState('El día 12 de abril de 2025, la actora intentó descender del colectivo en parada autorizada. El conductor arrancó intempestivamente con las puertas abiertas, provocándole caída y fractura de tibia.');
  const [pretensionEscrito, setPretensionEscrito] = useState('Resarcimiento integral de incapacidad física sobreviniente, daño moral y gastos médicos, más intereses y costas, fundado en los arts. 1708, 1716, 1722 y 1757 del CCCN.');
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftCopied, setDraftCopied] = useState(false);

  // Plazos Calculator State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [businessDays, setBusinessDays] = useState(5);
  const [calculatedDeadline, setCalculatedDeadline] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/cases')
      .then(res => res.json())
      .then(data => setCases(data.cases || []))
      .catch(console.error);
  }, []);

  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDrafting(true);
    setGeneratedDraft(null);

    try {
      const res = await fetch('/api/gemini/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoDocumento: tipoEscrito,
          fuero: fueroEscrito,
          jurisdiccion: activeJurisdiction,
          partes: {
            actor: clienteNombre,
            demandado: contraparteNombre
          },
          hechos: hechosEscrito,
          pretension: pretensionEscrito
        })
      });

      const data = await res.json();
      setGeneratedDraft(data.draft);
    } catch (err) {
      console.error(err);
      setGeneratedDraft('Error al generar el borrador procesal.');
    } finally {
      setIsDrafting(false);
    }
  };

  const calculateJudicialDeadline = (start: string, days: number) => {
    const cur = new Date(start);
    let added = 0;
    while (added < days) {
      cur.setDate(cur.getDate() + 1);
      const dayOfWeek = cur.getDay();
      // Skip weekends (0 is Sunday, 6 is Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        added++;
      }
    }
    const formatted = cur.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCalculatedDeadline(`${formatted} (más las dos primeras horas judiciales del día hábil posterior de 07:30 a 09:30 hs - plazo de gracia)`);
  };

  const handleExportDraftTxt = () => {
    if (!generatedDraft) return;
    const blob = new Blob([generatedDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Borrador_${tipoEscrito.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c378] text-xs font-semibold uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5" /> Práctica Forense & Estudio Jurídico Digital
            </div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#fdfbf7]">
              Despacho de Litigación & Redacción Forense
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Gestión integral de expedientes judiciales, cálculo de plazos perentorios y generación asistida por IA de borradores procesales (demandas, cartas documento, contestaciones y contratos).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#122042] p-1 rounded-xl border border-[#1d2f5d] self-start">
            <button
              onClick={() => setActiveTab('agentes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'agentes' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Galería de Agentes IA
            </button>
            <button
              onClick={() => setActiveTab('carta_documento')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'carta_documento' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" /> Carta Documento & Escritos (DOC/PDF)
            </button>
            <button
              onClick={() => setActiveTab('expedientes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'expedientes' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Expedientes Activos
            </button>
            <button
              onClick={() => setActiveTab('redactor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'redactor' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Redactor Forense IA
            </button>
            <button
              onClick={() => setActiveTab('plazos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'plazos' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calculator className="w-3 h-3" /> Cómputo de Plazos
            </button>
            {onOpenMultiAgentStudio && (
              <button
                onClick={onOpenMultiAgentStudio}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#172a54] hover:bg-[#1f376d] text-[#f3dfa2] border border-[#c5a059]/40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#c5a059]" /> Mesa Orquestadora Completa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 0. AgentGallery Tab */}
      {activeTab === 'agentes' && (
        <AgentGallery
          onOpenCartaDocumento={() => setActiveTab('carta_documento')}
        />
      )}

      {/* 0.5. Carta Documento & Escritos Fehacientes Builder Tab */}
      {activeTab === 'carta_documento' && (
        <CartaDocumentoBuilder />
      )}

      {/* 1. Expedientes Tab */}
      {activeTab === 'expedientes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCase && onSelectCase(c)}
                className="group cursor-pointer bg-[#0c162e] hover:bg-[#112042] border border-[#1d2f5d] hover:border-[#c5a059]/60 p-5 rounded-2xl transition-all shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#c5a059] font-bold">{c.numeroExpediente}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    {c.fuero}
                  </span>
                </div>

                <h3 className="font-serif font-semibold text-sm text-[#fdfbf7] group-hover:text-[#c5a059] transition-colors leading-snug">
                  {c.caratula}
                </h3>

                <p className="text-xs text-slate-400">
                  {c.juzgado}
                </p>

                <div className="p-2.5 rounded-xl bg-[#091329] border border-[#1d2f5d]/70 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Cliente:</span>
                    <span className="font-medium text-slate-200">{c.cliente}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Estado:</span>
                    <span className="font-medium text-amber-300">{c.estadoProcesal}</span>
                  </div>
                </div>

                {c.proximoVencimiento && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.proximoVencimiento}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#1d2f5d]/50 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{c.documentosAdjuntos.length} piezas adjuntas</span>
                  <span className="text-[#c5a059] flex items-center gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
                    Ver Expediente Digital <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Procedural Drafter Tab */}
      {activeTab === 'redactor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Drafter Configuration Form (5 cols) */}
          <div className="lg:col-span-5 bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#fdfbf7] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a059]" /> Parámetros del Escrito Judicial
            </h2>

            <form onSubmit={handleGenerateDraft} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tipo de Actuación / Escrito:</label>
                <select
                  value={tipoEscrito}
                  onChange={(e) => setTipoEscrito(e.target.value)}
                  className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Demanda Ordinaria por Daños y Perjuicios">Demanda Ordinaria por Daños y Perjuicios</option>
                  <option value="Demanda Laboral por Despido Incausado y Multas">Demanda Laboral por Despido Incausado y Multas</option>
                  <option value="Contestación de Demanda y Oposición de Excepciones">Contestación de Demanda y Oposición de Excepciones</option>
                  <option value="Carta Documento de Intimación Laboral (Ley 23.789)">Carta Documento de Intimación Laboral</option>
                  <option value="Carta Documento de Intimación de Pago y Cumplimiento">Carta Documento de Cumplimiento Contractual</option>
                  <option value="Contrato de Locación de Inmueble con Cláusulas de Garantía">Contrato de Locación (CCCN)</option>
                  <option value="Recurso de Apelación con Expresión de Agravios">Recurso de Apelación</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Actor / Requirente:</label>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Demandado / Requerido:</label>
                  <input
                    type="text"
                    value={contraparteNombre}
                    onChange={(e) => setContraparteNombre(e.target.value)}
                    className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Plataforma Fáctica (Hechos sucintos):</label>
                <textarea
                  rows={4}
                  value={hechosEscrito}
                  onChange={(e) => setHechosEscrito(e.target.value)}
                  className="w-full bg-[#122042] text-slate-100 text-xs rounded-xl p-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pretensión & Rubros Reclamados:</label>
                <textarea
                  rows={3}
                  value={pretensionEscrito}
                  onChange={(e) => setPretensionEscrito(e.target.value)}
                  className="w-full bg-[#122042] text-slate-100 text-xs rounded-xl p-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <button
                type="submit"
                disabled={isDrafting}
                className="w-full bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isDrafting ? 'Generando Escrito Forense...' : 'Generar Borrador Procesal'}</span>
              </button>
            </form>
          </div>

          {/* Draft Preview & Editor (7 cols) */}
          <div className="lg:col-span-7 bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[650px]">
            <div className="flex items-center justify-between border-b border-[#1d2f5d] pb-3 mb-3 text-xs">
              <span className="font-serif font-bold text-[#fdfbf7] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#c5a059]" /> Borrador Forense Generado
              </span>
              {generatedDraft && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDraft);
                      setDraftCopied(true);
                      setTimeout(() => setDraftCopied(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-[#122042] text-slate-300 hover:text-white border border-[#1d2f5d] text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {draftCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#c5a059]" />}
                    <span>Copiar</span>
                  </button>
                  <button
                    onClick={() => exportLegalDraftToDOC(tipoEscrito, generatedDraft)}
                    className="p-1.5 rounded-lg bg-[#122042] text-slate-300 hover:text-white border border-[#1d2f5d] text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Emitir DOC</span>
                  </button>
                  <button
                    onClick={() => exportLegalDraftToPDF(tipoEscrito, generatedDraft)}
                    className="p-1.5 rounded-lg bg-[#122042] text-slate-300 hover:text-white border border-[#1d2f5d] text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Emitir PDF</span>
                  </button>
                  <button
                    onClick={handleExportDraftTxt}
                    className="p-1.5 rounded-lg bg-[#122042] text-slate-300 hover:text-white border border-[#1d2f5d] text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>TXT</span>
                  </button>
                  <a
                    href="https://miscomunicacionesdigitales.com.ar/account/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#c5a059] to-[#a68138] text-[#0b1325] font-bold text-xs flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Mis Comunicaciones Digitales</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#0a1327] rounded-xl border border-[#1d2f5d] font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {generatedDraft ? (
                generatedDraft
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Briefcase className="w-8 h-8 text-[#1d2f5d] mb-2" />
                  <p>Complete los parámetros y presione "Generar Borrador Procesal".</p>
                  <p className="text-[11px] mt-1 text-slate-600">El texto incluirá las pautas forenses argentinas con campos para rellenar.</p>
                </div>
              )}
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Aviso Deontológico: Todo escrito procesal es un borrador auxiliar. Requiere verificación de personería, derecho aplicable y firma ológrafa/electrónica por letrado matriculado.</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Deadlines Calculator Tab */}
      {activeTab === 'plazos' && (
        <div className="max-w-3xl mx-auto bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#fdfbf7]">
            <Calculator className="w-4 h-4 text-[#c5a059]" /> Calculadora Procesal de Días Hábiles Judiciales
          </div>
          <p className="text-xs text-slate-400">
            Computa plazos procesales excluyendo días inhábiles (sábados y domingos). Advierte sobre el plazo de gracia procesal de las dos primeras horas del día posterior (art. 124 CPCCN).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Fecha de Notificación / Inicio del Cómputo:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Días Hábiles de Plazo Procesal:</label>
              <select
                value={businessDays}
                onChange={(e) => setBusinessDays(parseInt(e.target.value))}
                className="w-full bg-[#122042] text-slate-100 rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              >
                <option value={3}>3 días hábiles (Recursos ordinarios / Reposición)</option>
                <option value={5}>5 días hábiles (Traslados ordinarios / Impugnaciones periciales)</option>
                <option value={10}>10 días hábiles (Expresión de agravios / Recursos apelación)</option>
                <option value={15}>15 días hábiles (Contestación demanda ordinaria)</option>
                <option value={60}>60 días hábiles (Caducidad de instancia primera instancia)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => calculateJudicialDeadline(startDate, businessDays)}
              className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] px-6 py-2.5 rounded-xl font-bold text-xs"
            >
              Calcular Fecha de Vencimiento
            </button>
          </div>

          {calculatedDeadline && (
            <div className="p-4 rounded-xl bg-[#091329] border border-[#c5a059]/40 space-y-2 animate-in fade-in">
              <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider font-semibold">
                Resultado del Cómputo:
              </span>
              <p className="text-sm font-serif font-bold text-[#fdfbf7]">
                Vence el: {calculatedDeadline}
              </p>
              <p className="text-[11px] text-slate-400 italic">
                * Importante: Debe cotejarse con el calendario de feriados nacionales, asuetos judiciales y feria extraordinaria del tribunal de radicación.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
