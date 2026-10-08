import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  AlertTriangle, 
  BookOpen, 
  Gavel, 
  FileText, 
  CornerDownRight, 
  RefreshCw, 
  ExternalLink, 
  ChevronDown, 
  Layers, 
  Paperclip, 
  Trash2,
  FileDown,
  Scale
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  ChatMessage, 
  Jurisdiction, 
  LegalBranch, 
  ResponseDepth 
} from '../types/index.ts';
import { exportElementToPDF } from '../utils/pdfExport.ts';

const legalBranches: LegalBranch[] = [
  'Derecho Constitucional',
  'Derecho Civil y Comercial',
  'Derecho del Trabajo y Seguridad Social',
  'Derecho Penal y Procesal Penal',
  'Derecho Administrativo',
  'Derecho Tributario y Financiero',
  'Derecho de Familia y Sucesiones',
  'Derecho Ambiental y Recursos Naturales',
  'Derecho Internacional Público y DDHH',
];

const presetQuestions = [
  '¿Cuál es la diferencia entre el factor objetivo y subjetivo de atribución en el Código Civil y Comercial de la Nación?',
  'Explique los requisitos y alcance de la acción de amparo colectivo según el fallo "Halabi" de la CSJN.',
  '¿Cómo se computa la indemnización por despido incausado del art. 245 LCT y qué pauta fijó la CSJN en "Vizzoti"?',
  '¿Cuáles son las condiciones de validez del ejercicio del ius variandi conforme al art. 66 de la LCT?',
  'Analice la constitucionalidad de la tenencia de estupefacientes para consumo personal a la luz del fallo "Arriola".',
];

export const LegalAssistantView: React.FC = () => {
  const { user, activeRole, activeJurisdiction } = useAuth();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      content: `Estimado colega / estudiante: Soy el Asistente Jurídico de **Academia Virtual del Derecho — Legal AI**.
      
Estoy configurado para asistirle con estricto apego al ordenamiento jurídico de la **República Argentina**, diferenciando categóricamente el texto normativo vigente de la interpretación doctrinaria y los precedentes judiciales.

Puede consultar sobre normas positivas, análisis de casos hipotéticos, líneas de la Corte Suprema de Justicia de la Nación o solicitar esquemas e informes jurídicos.

*Aviso Deontológico: Todas las respuestas son orientativas y no sustituyen el criterio profesional ni la firma de un letrado matriculado.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<LegalBranch>('Derecho Civil y Comercial');
  const [selectedDepth, setSelectedDepth] = useState<ResponseDepth>('profesional');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction>(activeJurisdiction);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachedText, setAttachedText] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pdfTranscriptRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    let fullPrompt = textToSend;
    if (attachedText) {
      fullPrompt = `${textToSend}\n\n[DOCUMENTO ADJUNTO PARA ANÁLISIS]:\n${attachedText}`;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend + (attachedText ? ' *(Archivo/Texto adjunto para cotejo)*' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      branch: selectedBranch,
      jurisdiction: selectedJurisdiction,
      depth: selectedDepth
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setAttachedText(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullPrompt,
          jurisdiction: selectedJurisdiction,
          branch: selectedBranch,
          depth: selectedDepth,
          role: activeRole,
          history: messages.slice(-4)
        })
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        content: data.content || 'Sin respuesta del motor jurídico.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
        depth: selectedDepth,
        branch: selectedBranch,
        jurisdiction: selectedJurisdiction,
        insufficientEvidence: data.insufficientEvidence
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'Ocurrió un error al contactar el servidor de inferencia jurídica. Por favor, intente nuevamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportPDF = async () => {
    if (!pdfTranscriptRef.current || isExportingPDF) return;
    const dateStr = new Date().toISOString().split('T')[0];
    await exportElementToPDF(pdfTranscriptRef.current, {
      filename: `Consulta_Juridica_AVD_${dateStr}.pdf`,
      onProgress: setIsExportingPDF,
    });
  };

  const handleExportChat = () => {
    const chatExport = messages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.content}\n\n`).join('------------------------\n\n');
    const blob = new Blob([chatExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Consulta_Juridica_AVD_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    if (window.confirm('¿Desea limpiar el historial de la conversación actual?')) {
      setMessages([messages[0]]);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col max-w-7xl mx-auto">
      {/* Top Configuration Bar: Branch, Jurisdiction, Depth */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-xl p-3.5 mb-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Legal Branch */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Rama:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value as LegalBranch)}
              className="bg-[#122042] text-slate-200 border border-[#1d2f5d] rounded-md px-2.5 py-1 focus:outline-none focus:border-[#c5a059]"
            >
              {legalBranches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Depth */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Profundidad:</span>
            <div className="inline-flex rounded-md p-0.5 bg-[#122042] border border-[#1d2f5d]">
              {(['simple', 'academica', 'profesional'] as ResponseDepth[]).map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDepth(d)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-all ${
                    selectedDepth === d 
                      ? 'bg-[#c5a059] text-[#0b1325] font-bold shadow-xs' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Jurisdiction */}
          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <span>Jurisdicción:</span>
            <span className="text-[#e5c378] font-semibold">{selectedJurisdiction}</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF || messages.length <= 1}
            className="p-1.5 px-2.5 rounded-lg bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-40 transition-all cursor-pointer"
            title="Exportar transcripción formal en PDF con jspdf y html2canvas"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isExportingPDF ? 'Generando...' : 'Exportar PDF'}</span>
          </button>
          <button
            onClick={handleExportChat}
            className="p-1.5 rounded-lg bg-[#122042] hover:bg-[#1a2e5c] text-slate-300 hover:text-white border border-[#1d2f5d] text-xs flex items-center gap-1 cursor-pointer"
            title="Exportar conversación en texto plano"
          >
            <Download className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="hidden sm:inline">TXT</span>
          </button>
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg bg-[#122042] hover:bg-rose-900/30 text-slate-400 hover:text-rose-300 border border-[#1d2f5d] text-xs cursor-pointer"
            title="Limpiar conversación"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a059] to-[#876524] p-0.5 shrink-0 shadow-md">
                <div className="w-full h-full bg-[#0b1325] rounded-[6px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#f3dfa2]" />
                </div>
              </div>
            )}

            <div className={`max-w-3xl rounded-2xl p-4.5 text-xs leading-relaxed shadow-sm ${
              msg.sender === 'user'
                ? 'bg-[#15274d] text-slate-100 border border-[#213768] rounded-br-xs'
                : 'bg-[#0c162e] text-slate-200 border border-[#1d2f5d] rounded-bl-xs'
            }`}>
              <div className="flex items-center justify-between mb-2 text-[10px] text-slate-400 border-b border-white/5 pb-1">
                <span className="font-semibold text-[#c5a059]">
                  {msg.sender === 'assistant' ? 'Academia Virtual del Derecho — Asistente IA' : user.name}
                </span>
                <span className="font-mono">{msg.timestamp}</span>
              </div>

              {/* Formatted Markdown-like Content */}
              <div className="whitespace-pre-wrap font-sans text-slate-200 space-y-2">
                {msg.content}
              </div>

              {/* Verified Citations Drawer if available */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-[#1d2f5d]/70">
                  <div className="text-[10px] uppercase font-bold text-[#c5a059] tracking-wider flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3 h-3" /> Citas y Fuentes Oficiales Cotejadas:
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.citations.map((cite, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-[#101e3d] border border-[#1d2f5d] text-[11px]">
                        <div className="flex items-center justify-between font-semibold text-slate-200">
                          <span className="text-[#f3dfa2]">{cite.sourceTitle}</span>
                          <span className="text-[10px] font-mono text-emerald-400">Relevancia {cite.relevanceScore}</span>
                        </div>
                        <p className="text-slate-400 mt-1 italic text-[10.5px]">
                          "{cite.snippet}"
                        </p>
                        {cite.officialUrl && (
                          <a 
                            href={cite.officialUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-[#c5a059] hover:underline"
                          >
                            Ver publicación oficial <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions on Message */}
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                <span className="italic">
                  {msg.sender === 'assistant' ? 'Fundamentado en derecho argentino positivo' : 'Consulta procesada'}
                </span>
                <button
                  onClick={() => handleCopy(msg.content, msg.id)}
                  className="hover:text-slate-200 flex items-center gap-1 text-[11px]"
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copiar texto
                    </>
                  )}
                </button>
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-[#192b52] border border-[#2b447e] flex items-center justify-center text-xs font-serif font-bold text-slate-200 shrink-0">
                {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a059] to-[#876524] p-0.5 shrink-0 animate-pulse">
              <div className="w-full h-full bg-[#0b1325] rounded-[6px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#f3dfa2]" />
              </div>
            </div>
            <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-4 text-xs text-slate-300 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-[#c5a059] animate-spin" />
              <span>Analizando derecho positivo, cotejando doctrina CSJN y redactando respuesta fundamentada...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      {messages.length <= 2 && (
        <div className="py-2">
          <p className="text-[11px] text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#c5a059]" /> Consultas jurídicas sugeridas para iniciar:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {presetQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] bg-[#0c1832] hover:bg-[#122246] text-slate-300 hover:text-white border border-[#1d2f5d] rounded-lg px-2.5 py-1 text-left truncate max-w-md transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Preview if any */}
      {attachedText && (
        <div className="bg-[#0f1d3c] border border-[#c5a059]/40 rounded-lg p-2.5 mb-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 truncate text-slate-200">
            <Paperclip className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="font-semibold text-[#e5c378]">Texto adjunto para análisis:</span>
            <span className="truncate max-w-lg text-slate-400 font-mono text-[11px]">
              "{attachedText.slice(0, 80)}..."
            </span>
          </div>
          <button onClick={() => setAttachedText(null)} className="text-slate-400 hover:text-rose-400 text-xs">
            Quitar
          </button>
        </div>
      )}

      {/* Input Box Area */}
      <div className="mt-2 bg-[#0c162e] border border-[#1d2f5d] rounded-xl p-2.5 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => {
              const pasted = prompt('Pegue aquí el fragmento de la demanda, fallo o contrato para analizar con la consulta:');
              if (pasted) setAttachedText(pasted);
            }}
            className="p-2 rounded-lg bg-[#122042] text-slate-400 hover:text-[#c5a059] hover:bg-[#182a54] transition-colors"
            title="Adjuntar fragmento de documento o caso"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Formule su pregunta jurídica, solicite análisis de caso o redacción de informe..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 text-xs focus:outline-none px-2"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] hover:to-[#b38728] disabled:opacity-40 text-[#0b1325] px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Consultar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 px-1 border-t border-white/5 pt-1.5">
          <span>Inferencia procesada desde el servidor seguro con modelo Gemini 3.8 Flash</span>
          <span className="text-amber-500/80">Requiere verificación por matriculado</span>
        </div>
      </div>

      {/* Hidden/Off-Screen Printable Document for html2canvas & jsPDF */}
      <div 
        ref={pdfTranscriptRef} 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: 0, 
          width: '800px', 
          backgroundColor: '#ffffff', 
          color: '#0f172a', 
          padding: '40px',
          boxSizing: 'border-box'
        }}
      >
        {/* Document Header */}
        <div style={{ borderBottom: '3px solid #c5a059', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'bold', color: '#0b1325', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Academia Virtual del Derecho
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#c5a059', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Plataforma de Inteligencia Jurídica & Práctica Forense
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', backgroundColor: '#0b1325', color: '#fdfbf7', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                REPORTE OFICIAL
              </span>
            </div>
          </div>
        </div>

        {/* Metadata Box */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px', fontSize: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div><strong>Letrada / Usuario:</strong> {user.name} ({user.matricula || 'Matrícula CPACF'})</div>
            <div><strong>Fecha de Expedición:</strong> {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong>Jurisdicción:</strong> {selectedJurisdiction}</div>
            <div><strong>Rama del Derecho:</strong> {selectedBranch}</div>
            <div><strong>Enfoque y Profundidad:</strong> Nivel {selectedDepth.toUpperCase()}</div>
            <div><strong>Motor de Inferencia:</strong> Gemini 3.8 Flash (Server-Side)</div>
          </div>
        </div>

        {/* Content Section */}
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#0b1325', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>
          Transcripción Formal de Consultas y Dictámenes
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              style={{ 
                borderLeft: msg.sender === 'user' ? '4px solid #1e293b' : '4px solid #c5a059',
                backgroundColor: msg.sender === 'user' ? '#f1f5f9' : '#fafaf9',
                padding: '14px',
                borderRadius: '0 8px 8px 0',
                fontSize: '12px',
                lineHeight: '1.6'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>
                <span>{msg.sender === 'user' ? `CONSULTA DE: ${user.name.toUpperCase()}` : 'RESPUESTA / DICTAMEN ASISTIDO POR IA'}</span>
                <span>{msg.timestamp}</span>
              </div>

              <div style={{ whiteSpace: 'pre-wrap', color: '#1e293b', fontFamily: msg.sender === 'assistant' ? 'Georgia, serif' : 'system-ui, sans-serif' }}>
                {msg.content}
              </div>

              {/* Citations if any */}
              {msg.citations && msg.citations.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#c5a059', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Fuentes y Precedentes Cotejados:
                  </span>
                  {msg.citations.map((cite, cIdx) => (
                    <div key={cIdx} style={{ fontSize: '10.5px', color: '#475569', marginBottom: '4px' }}>
                      • <strong>{cite.sourceTitle}</strong>: "{cite.snippet}" {cite.officialUrl ? `(${cite.officialUrl})` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Deontological Disclaimer Footer */}
        <div style={{ marginTop: '36px', paddingTop: '16px', borderTop: '1px solid #cbd5e1', fontSize: '10px', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#334155' }}>
            AVISO DEONTOLÓGICO Y ALCANCE PROFESIONAL
          </p>
          <p style={{ margin: 0 }}>
            El presente documento ha sido generado como herramienta tecnológica auxiliar para estudio e investigación jurídica mediante modelos de inteligencia artificial y cotejo documental en fuentes oficiales de la República Argentina. No sustituye el asesoramiento, dictamen ni la firma de un letrado debidamente matriculado.
          </p>
          <p style={{ margin: '6px 0 0 0', fontStyle: 'italic' }}>
            Academia Virtual del Derecho — República Argentina
          </p>
        </div>
      </div>
    </div>
  );
};
