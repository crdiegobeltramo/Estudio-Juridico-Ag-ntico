import React, { useState, useRef } from 'react';
import { 
  ScrollText, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  BookOpen, 
  Gavel, 
  Printer, 
  Sparkles, 
  Save,
  FileDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { exportElementToPDF } from '../utils/pdfExport.ts';

export const ResearchView: React.FC = () => {
  const { user } = useAuth();
  const [noteTitle, setNoteTitle] = useState('Dictamen de Responsabilidad Objetiva y Prevención del Daño');
  const [noteContent, setNoteContent] = useState(`DICTAMEN JURÍDICO DOCTRINAL

TEMA: La función preventiva de la responsabilidad civil y su relación con el factor objetivo de atribución en el Código Civil y Comercial de la Nación.

I. MARCO POSITIVO APLICABLE:
- Art. 1708 CCCN: Consagra la doble función (preventiva y resarcitoria).
- Art. 1710 CCCN: Impone a toda persona el deber general de prevención de evitar causar daños no justificados y de adoptar medidas idóneas para disminuir su magnitud.
- Art. 1722 CCCN: Define el factor objetivo en supuestos donde la culpa es irrelevante, operando únicamente la liberación mediante la acreditación de la fractura del nexo causal (hecho del damnificado, de un tercero extraño o caso fortuito).

II. PRECEDENTES VINCULANTES DE LA CSJN:
- CSJN, "Aquino, Isacio c/ Cargo Servicios Industriales S.A." (Fallos 327:3753): La Corte consagró el principio "alterum non laedere" con raigambre constitucional (art. 19 CN), declarando el derecho a la reparación integral del daño.
- CSJN, "Halabi, Ernesto" (Fallos 332:111): Legitimación colectiva para prevención y cese de daños homogéneos.

III. CONCLUSIONES FORENSES:
La tutela preventiva puede articularse por vía de acción preventiva autónoma (art. 1711 CCCN) o medida cautelar innovativa previa, sin necesidad de aguardar la consumación del perjuicio económico.`);

  const [citationFormat, setCitationFormat] = useState<'fallos' | 'ley' | 'apa'>('fallos');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const pdfPrintRef = useRef<HTMLDivElement>(null);

  const sampleCitations = {
    fallos: 'CSJN, "Halabi, Ernesto c/ P.E.N. s/ amparo", 24/02/2009, Fallos 332:111.',
    ley: 'Código Civil y Comercial de la Nación, Ley 26.994, arts. 1708, 1710 y 1722 (B.O. 08/10/2014).',
    apa: 'Lorenzetti, R. L. (2015). Código Civil y Comercial de la Nación Comentado. Buenos Aires: Rubinzal-Culzoni.'
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(`# ${noteTitle}\n\n${noteContent}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!pdfPrintRef.current || isExportingPDF) return;
    const safeFilename = noteTitle.trim().replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_');
    await exportElementToPDF(pdfPrintRef.current, {
      filename: `${safeFilename || 'Dictamen_Juridico'}.pdf`,
      onProgress: setIsExportingPDF,
    });
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([`# ${noteTitle}\n\n${noteContent}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c378] text-xs font-semibold uppercase tracking-wider mb-2">
              <ScrollText className="w-3.5 h-3.5" /> Taller de Investigación & Documentos
            </div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#fdfbf7]">
              Editor Forense & Generador de Citas Jurídicas
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Elabore notas doctrinales, fichas bibliográficas y dictámenes con formato estandarizado según las pautas de cita de la Corte Suprema y exporte documentos oficiales en PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            <button
              onClick={handleSave}
              className="bg-[#122042] hover:bg-[#182a54] text-slate-200 border border-[#1d2f5d] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-[#c5a059]" />}
              <span>{savedSuccess ? 'Guardado' : 'Guardar'}</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              title="Exportar documento formateado en PDF con jspdf y html2canvas"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExportingPDF ? 'Generando PDF...' : 'Exportar PDF'}</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="bg-[#14264d] hover:bg-[#1a3266] text-slate-200 border border-[#1d2f5d] px-3.5 py-2 rounded-xl font-medium text-xs flex items-center gap-1.5 cursor-pointer"
              title="Descargar en formato Markdown"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>MD</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Area (8 cols) */}
        <div className="lg:col-span-8 bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Título del Proyecto / Dictamen:</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full bg-[#122042] text-slate-100 font-serif font-bold text-base rounded-xl px-4 py-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="flex-1 flex flex-col space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-400 pb-1">
              <span>Cuerpo del Documento (Markdown / Texto Jurídico):</span>
              <button
                onClick={handleCopyNote}
                className="hover:text-white flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#c5a059]" />}
                <span>{copied ? 'Copiado' : 'Copiar todo'}</span>
              </button>
            </div>
            <textarea
              rows={16}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full flex-1 bg-[#0a1327] text-slate-200 font-mono text-xs rounded-xl p-4 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059] leading-relaxed"
            />
          </div>
        </div>

        {/* Sidebar: Citation Generator & Reference Assistant (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#fdfbf7]">
              <BookOpen className="w-4 h-4 text-[#c5a059]" /> Generador de Citas Oficiales
            </div>

            <div className="flex gap-1.5 p-1 bg-[#122042] rounded-xl border border-[#1d2f5d] text-xs">
              <button
                onClick={() => setCitationFormat('fallos')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  citationFormat === 'fallos' ? 'bg-[#c5a059] text-[#0b1325]' : 'text-slate-300'
                }`}
              >
                Fallos CSJN
              </button>
              <button
                onClick={() => setCitationFormat('ley')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  citationFormat === 'ley' ? 'bg-[#c5a059] text-[#0b1325]' : 'text-slate-300'
                }`}
              >
                Ley / B.O.
              </button>
              <button
                onClick={() => setCitationFormat('apa')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  citationFormat === 'apa' ? 'bg-[#c5a059] text-[#0b1325]' : 'text-slate-300'
                }`}
              >
                Doctrina / Libro
              </button>
            </div>

            <div className="p-3.5 bg-[#091329] border border-[#1d2f5d] rounded-xl space-y-2 text-xs">
              <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-wider block">
                Formato Estándar de Referencia:
              </span>
              <p className="font-mono text-slate-200 text-[11.5px] leading-relaxed select-all">
                {sampleCitations[citationFormat]}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sampleCitations[citationFormat]);
                  alert('Cita copiada al portapapeles.');
                }}
                className="text-[10.5px] text-[#c5a059] hover:underline flex items-center gap-1 pt-1"
              >
                <Copy className="w-3 h-3" /> Copiar esta cita de ejemplo
              </button>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Reglas de Citación Argentina:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[10.5px]">
                <li>Para sentencias de la CSJN: Indicar Tomo y Folio oficial de la Colección de Fallos.</li>
                <li>Para leyes nacionales: Citar número y fecha de publicación en Boletín Oficial.</li>
                <li>Para doctrina: Autor, Título en cursiva, Tomo/Página, Editorial y Año.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden/Off-Screen Printable Document for html2canvas & jsPDF */}
      <div 
        ref={pdfPrintRef} 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: 0, 
          width: '800px', 
          backgroundColor: '#ffffff', 
          color: '#0f172a', 
          padding: '44px',
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
                Dirección de Investigación Jurídica & Producción Doctrinal
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', backgroundColor: '#0b1325', color: '#fdfbf7', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                DICTAMEN FORENSE
              </span>
            </div>
          </div>
        </div>

        {/* Title and Metadata */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'bold', color: '#0b1325', margin: '0 0 12px 0', lineHeight: '1.4' }}>
            {noteTitle}
          </h2>

          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', fontSize: '11.5px', color: '#475569' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div><strong>Letrada / Autora:</strong> {user.name} ({user.matricula || 'Matrícula CPACF'})</div>
              <div><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div><strong>Jurisdicción:</strong> República Argentina</div>
              <div><strong>Espacio de Trabajo:</strong> {user.institution || 'Estudio Jurídico'}</div>
            </div>
          </div>
        </div>

        {/* Note Body */}
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '12.5px', lineHeight: '1.7', color: '#1e293b', whiteSpace: 'pre-wrap', marginBottom: '28px' }}>
          {noteContent}
        </div>

        {/* Reference Citation Box */}
        <div style={{ backgroundColor: '#fafaf9', borderLeft: '4px solid #c5a059', padding: '12px 16px', marginBottom: '24px', fontSize: '11px' }}>
          <strong style={{ color: '#0b1325', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>
            Pauta de Cita Doctrinaria / Jurisprudencial de Referencia:
          </strong>
          <span style={{ fontFamily: 'monospace', color: '#334155' }}>
            {sampleCitations[citationFormat]}
          </span>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '36px', paddingTop: '16px', borderTop: '1px solid #cbd5e1', fontSize: '10px', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#334155' }}>
            ACADEMIA VIRTUAL DEL DERECHO — LEGAL AI
          </p>
          <p style={{ margin: '3px 0 0 0' }}>
            Documento emitido con fines de análisis doctrinario y fundamentación procesal.
          </p>
        </div>
      </div>
    </div>
  );
};
