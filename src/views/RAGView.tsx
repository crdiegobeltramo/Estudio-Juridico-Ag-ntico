import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  FileUp, 
  ShieldAlert, 
  ExternalLink, 
  Layers, 
  Sliders, 
  CheckCircle,
  Database,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Citation } from '../types/index.ts';

export const RAGView: React.FC = () => {
  const { activeJurisdiction } = useAuth();
  const [query, setQuery] = useState('');
  const [minThreshold, setMinThreshold] = useState(0.25);
  const [isLoading, setIsLoading] = useState(false);
  const [ragResult, setRagResult] = useState<{
    content: string;
    insufficientEvidence?: boolean;
    topScore?: number;
    citations?: Citation[];
  } | null>(null);

  // Ingestion Modal / Tab state
  const [activeTab, setActiveTab] = useState<'search' | 'upload'>('search');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadText, setUploadText] = useState('');
  const [uploadBranch, setUploadBranch] = useState('Derecho Civil y Comercial');
  const [uploadSource, setUploadSource] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleRAGSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setRagResult(null);

    try {
      const res = await fetch('/api/gemini/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          minThreshold,
          jurisdiction: activeJurisdiction
        })
      });
      const data = await res.json();
      setRagResult(data);
    } catch (err) {
      console.error(err);
      setRagResult({
        content: 'Error al ejecutar el motor RAG.',
        insufficientEvidence: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadText.trim()) return;

    try {
      const res = await fetch('/api/library/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          category: 'doctrina',
          branch: uploadBranch,
          jurisdiction: activeJurisdiction,
          courtOrOrganism: 'Aporte de Usuario Verificado',
          fullText: uploadText,
          officialSourceUrl: uploadSource,
          tags: ['Carga RAG', uploadBranch]
        })
      });
      const data = await res.json();
      if (data.success) {
        setUploadSuccess(`Documento incorporado exitosamente. Se generaron ${data.chunksCreated} fragmentos indexados listos para búsqueda vectorial.`);
        setUploadTitle('');
        setUploadText('');
        setUploadSource('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c378] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Retrieval-Augmented Generation Jurídico
            </div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#fdfbf7]">
              Motor RAG con Control Estricto de Veracidad
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-3xl leading-relaxed">
              Recupera exclusivamente fragmentos de legislación y jurisprudencia autorizados. Si el umbral de similitud es inferior a la evidencia verificada, el sistema emite una <strong>respuesta de abstención</strong> garantizando la integridad deontológica sin alucinaciones.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#122042] p-1 rounded-xl border border-[#1d2f5d] self-start">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'search' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Consulta RAG
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'upload' ? 'bg-[#c5a059] text-[#0b1325] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" /> Ingesta de Documentos
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'search' ? (
        <>
          {/* Query & Parameters Card */}
          <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-5 shadow-sm space-y-4">
            <form onSubmit={handleRAGSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Pregunta o Hipótesis Jurídica para contraste documental:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ej: ¿Cuáles son las causales de exoneración en el factor de atribución objetivo del CCCN?"
                      className="w-full bg-[#122042] text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-2 shrink-0 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isLoading ? 'Recuperando...' : 'Consultar RAG'}</span>
                  </button>
                </div>
              </div>

              {/* Threshold Slider */}
              <div className="p-3 bg-[#0e1b38] rounded-xl border border-[#1d2f5d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Sliders className="w-4 h-4 text-[#c5a059]" />
                  <span>Umbral Mínimo de Relevancia Documental (Similitud Vectorial):</span>
                  <span className="font-mono font-bold text-[#e5c378]">{minThreshold}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.10"
                    max="0.80"
                    step="0.05"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
                    className="accent-[#c5a059] cursor-pointer w-32"
                  />
                  <span className="text-[10px] text-slate-400">
                    {minThreshold > 0.4 ? 'Alta exigencia probatoria' : 'Equilibrado'}
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Results Display */}
          {ragResult && (
            <div className="space-y-4">
              {/* Abstention Banner if Insufficient Evidence */}
              {ragResult.insufficientEvidence && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-300">Regla Deontológica de Abstención Activada</h4>
                    <p className="mt-1 leading-relaxed text-slate-300">
                      El motor RAG no ha hallado fragmentos normativos o fallos en la base oficial que superen el umbral exigido de {minThreshold}. Para salvaguardar la exactitud del análisis, la IA se abstiene de realizar afirmaciones sin respaldo fáctico.
                    </p>
                  </div>
                </div>
              )}

              {/* Main Response Card */}
              <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#1d2f5d] pb-3 text-xs">
                  <span className="font-serif font-bold text-[#fdfbf7] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#c5a059]" /> Respuesta Fundamentada en Citas Recuperadas
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Puntaje Máximo de Similitud: {ragResult.topScore?.toFixed(2) || '0.00'}
                  </span>
                </div>

                <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                  {ragResult.content}
                </div>

                {/* Citations List */}
                {ragResult.citations && ragResult.citations.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-[#1d2f5d] space-y-3">
                    <h4 className="text-xs font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" /> Fragmentos y Fuentes Recuperadas para este Resultado:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ragResult.citations.map((cite, i) => (
                        <div key={i} className="p-3 bg-[#101d3a] border border-[#1d2f5d] rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#fdfbf7] truncate">{cite.sourceTitle}</span>
                            <span className="text-[10px] font-mono text-emerald-400">Relevancia {cite.relevanceScore}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] italic">
                            "{cite.snippet}"
                          </p>
                          {cite.officialUrl && (
                            <a 
                              href={cite.officialUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-[#c5a059] hover:underline pt-1"
                            >
                              Ver fuente oficial <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Ingestion / Upload Section */
        <div className="bg-[#0c162e] border border-[#1d2f5d] rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-serif font-bold text-[#fdfbf7] mb-2 flex items-center gap-2">
            <FileUp className="w-4 h-4 text-[#c5a059]" /> Ingesta & Fragmentación de Documentos Jurídicos
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Cargue artículos doctrinales, notas a fallos o normativas locales para segmentarlas en fragmentos semánticos e indexarlas en la base RAG de la plataforma.
          </p>

          {uploadSuccess && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título del Documento:</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ej: Análisis Crítico de la Responsabilidad Civil Preventiva en CCCN"
                  className="w-full bg-[#122042] text-slate-100 text-xs rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rama del Derecho:</label>
                <select
                  value={uploadBranch}
                  onChange={(e) => setUploadBranch(e.target.value)}
                  className="w-full bg-[#122042] text-slate-100 text-xs rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Derecho Constitucional">Derecho Constitucional</option>
                  <option value="Derecho Civil y Comercial">Derecho Civil y Comercial</option>
                  <option value="Derecho del Trabajo y Seguridad Social">Derecho del Trabajo y Seguridad Social</option>
                  <option value="Derecho Penal y Procesal Penal">Derecho Penal y Procesal Penal</option>
                  <option value="Derecho Administrativo">Derecho Administrativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">URL Oficial o Fuente de Origen:</label>
              <input
                type="text"
                value={uploadSource}
                onChange={(e) => setUploadSource(e.target.value)}
                placeholder="Ej: https://repositorio.derecho.uba.ar/articulos/10293"
                className="w-full bg-[#122042] text-slate-100 text-xs rounded-xl px-3 py-2 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Texto Completo del Documento (para fragmentación):</label>
              <textarea
                required
                rows={8}
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder="Pegue aquí el texto íntegro del fallo, artículo doctrinal o ley. El motor lo segmentará por párrafos y generará el índice de recuperación..."
                className="w-full bg-[#122042] text-slate-100 text-xs rounded-xl p-3 border border-[#1d2f5d] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-[#c5a059] to-[#a68138] hover:from-[#d4af37] text-[#0b1325] px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm"
              >
                Procesar e Indexar Documento en RAG
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
